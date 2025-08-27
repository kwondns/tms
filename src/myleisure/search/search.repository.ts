import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MapSearchType, SearchType } from '@/myleisure/search/types/search.type';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Leisure } from '@/myleisure/entities/leisure/leisure.entity';

@Injectable()
export class SearchRepository {
  constructor(
    @InjectRepository(Leisure) private readonly leisureRepo: Repository<Leisure>,
    private readonly dataSource: DataSource,
  ) {}

  async search(payload: SearchType) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      const addresses: string[] = payload.address ? JSON.parse(payload.address) : [];

      // 1) 항상 $1에 search 문자열(null 또는 '') 바인딩
      const searchTerm = payload.search || null;

      // 2) 주소 필터용 ($2..$N)
      const addrParams = addresses;

      // 3) 그 다음 순서로 category, sortKey, offset
      const categoryPattern = payload.category ?? '%';
      const sortKey = payload.order ?? 'blog';
      const offset = (payload.page - 1) * 20;

      // 4) SELECT 절 relevance (searchTerm이 null이면 0)
      const selectRelevance = `,
  CASE
    WHEN $1::text IS NOT NULL AND length($1::text) > 0 THEN
      ts_rank_cd(
        to_tsvector('simple',
          coalesce(business_name,'') || ' ' || coalesce(business_address,'')),
        plainto_tsquery('simple', $1::text)
      )
    ELSE 0
  END AS relevance`;

      // 5) WHERE full-text (searchTerm이 null이면 TRUE)
      const whereFullText = searchTerm
        ? `(
        to_tsvector('simple', coalesce(business_name,'') || ' ' || coalesce(business_address,''))
          @@ plainto_tsquery('simple', $1::text)
        OR business_name ILIKE '%' || $1::text || '%'
        OR business_address ILIKE '%' || $1::text || '%'
      )`
        : `TRUE`;

      // 6) 주소 ILIKE 필터 (없으면 TRUE)
      const likeConds = addresses.map((_, i) => `address ILIKE '%' || $${2 + i} || '%'`);
      const whereAddress = likeConds.length ? `(${likeConds.join(' OR ')})` : 'TRUE';

      // 7) 파라미터 인덱스 계산
      const categoryIdx = 2 + addresses.length;
      const sortKeyIdx = categoryIdx + 1;
      const offsetIdx = categoryIdx + 2;

      // 8) 최종 쿼리
      const query = `
    WITH base AS (
      SELECT
        id,
        blog_review_count    AS blogReview,
        business_name        AS name,
        address,
        business_photo       AS previewImg,
        visitor_review_count AS visitorReview,
        category
        ${selectRelevance}
      FROM myleisure.leisure
      WHERE
        ${whereFullText}
        AND category LIKE $${categoryIdx}
        AND ${whereAddress}
    )
    SELECT *
    FROM base
    ORDER BY
      CASE WHEN $${sortKeyIdx} = 'blog'    THEN blogReview    END DESC,
      CASE WHEN $${sortKeyIdx} = 'visitor' THEN visitorReview END DESC,
      CASE WHEN $${sortKeyIdx} = 'relevance' THEN relevance   END DESC,
      id ASC
    LIMIT 20 OFFSET $${offsetIdx};
  `;
      const params = [
        searchTerm, // $1
        ...addrParams, // $2..$N
        categoryPattern, // $categoryIdx
        sortKey, // $sortKeyIdx
        offset, // $offsetIdx
      ];
      const result = await queryRunner.query(query, params);
      await queryRunner.release();
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async searchCount(payload: SearchType) {
    const qb = this.leisureRepo.createQueryBuilder('l');

    // 주소 필터
    if (payload.search) {
      // 한글 지원이 필요하면 ILIKE 방식으로 대체
      qb.andWhere(
        `( to_tsvector('simple', coalesce(l.business_name, '') || ' ' || coalesce(l.business_address, '')) @@
         plainto_tsquery('simple', :term)
      OR l.business_name ILIKE :likeTerm
      OR l.business_address ILIKE :likeTerm )`,
        {
          term: payload.search,
          likeTerm: `%${payload.search}%`,
        },
      );
    }
    if (payload.address) {
      const addrs: string[] = JSON.parse(payload.address);
      addrs.forEach((addr, i) => {
        qb.andWhere('l.address ILIKE :addr' + i, {
          ['addr' + i]: `%${addr}%`,
        });
      });
    }
    qb.andWhere('l.category LIKE :category', {
      category: payload.category ?? '%',
    });
    return qb.getCount();
  }

  // async searchMap(payload: MapSearchType) {
  //   const qb = this.leisureRepo.createQueryBuilder('l');
  //
  //   // group_concat 길이 설정(별도 쿼리)
  //   await this.dataSource.query(`SET SESSION group_concat_max_len = 100000;`);
  //
  //   // 주소 배열 미리 선언
  //   const addrs: string[] = payload.address ? JSON.parse(payload.address) : [];
  //
  //   // WHERE 절 기본
  //   if (payload.search) {
  //     qb.where(`MATCH(l.business_name, l.business_address) AGAINST(:term IN NATURAL LANGUAGE MODE)`, {
  //       term: payload.search,
  //     });
  //   } else {
  //     qb.where('1=1');
  //   }
  //
  //   // 주소 필터
  //   addrs.forEach((addr, i) => {
  //     qb.andWhere(`l.address LIKE :addr${i}`, { [`addr${i}`]: `%${addr}%` });
  //   });
  //
  //   // 카테고리 필터
  //   qb.andWhere('l.category LIKE :category', { category: payload.category ?? '%' });
  //
  //   // SELECT 및 GROUP BY
  //   return await qb
  //     .select([
  //       'l.address AS address',
  //       'GROUP_CONCAT(l.id) AS ids',
  //       'GROUP_CONCAT(l.lng) AS lngs',
  //       'GROUP_CONCAT(l.lat) AS lats',
  //       'COUNT(l.id) AS addressCount',
  //       // subquery에서도 동일한 조건 사용
  //       `(SELECT COUNT(sub.id)
  //        FROM leisure sub
  //        WHERE ${
  //          payload.search
  //            ? `MATCH(sub.business_name, sub.business_address) AGAINST(:term IN NATURAL LANGUAGE MODE)`
  //            : '1=1'
  //        }
  //          AND sub.category LIKE :category
  //          ${addrs.map((_, i) => `AND sub.address LIKE :addr${i}`).join(' ')}
  //     ) AS totalCount`,
  //     ])
  //     .groupBy('l.address')
  //     .setParameters(
  //       addrs.reduce((params, _, i) => ({ ...params, [`addr${i}`]: `%${addrs[i]}%` }), {
  //         term: payload.search,
  //         category: payload.category ?? '%',
  //       }),
  //     )
  //     .getRawMany<{
  //       address: string;
  //       ids: string;
  //       lngs: string;
  //       lats: string;
  //       addressCount: number;
  //       totalCount: number;
  //     }>();
  // }

  async searchMap(payload: MapSearchType) {
    const qb = this.leisureRepo.createQueryBuilder('l');

    // 주소 배열 파싱
    const addrs: string[] = payload.address ? JSON.parse(payload.address) : [];

    // 1) 통합 검색어 조건(full-text OR ILIKE)
    const hasSearch = Boolean(payload.search);
    if (hasSearch) {
      qb.where(
        `( to_tsvector('simple', coalesce(l.business_name,'') || ' ' || coalesce(l.business_address,'')) @@
           plainto_tsquery('simple', :term)
         OR l.business_name ILIKE :likeTerm
         OR l.business_address ILIKE :likeTerm )`,
        { term: payload.search, likeTerm: `%${payload.search}%` },
      );
    } else {
      qb.where('1=1');
    }

    // 2) 주소 필터 (ILIKE)
    addrs.forEach((addr, i) => {
      qb.andWhere(`l.address ILIKE :addr${i}`, { [`addr${i}`]: `%${addr}%` });
    });

    // 3) 카테고리 필터
    qb.andWhere('l.category ILIKE :category', {
      category: payload.category ?? '%',
    });

    // 4) SELECT 및 GROUP BY
    //    - STRING_AGG: delimiter ',' 로 묶음
    //    - addressCount: 그룹별 개수
    //    - totalCount: 동일 조건의 전체 개수(서브쿼리)
    const subWhereClauses = [];

    // 서브쿼리 검색어 조건
    if (hasSearch) {
      subWhereClauses.push(
        `to_tsvector('simple', coalesce(sub.business_name,'') || ' ' || coalesce(sub.business_address,'')) @@ plainto_tsquery('simple', :term)`,
      );
      subWhereClauses.push(`sub.business_name ILIKE :likeTerm`);
      subWhereClauses.push(`sub.business_address ILIKE :likeTerm`);
    } else {
      subWhereClauses.push('1=1');
    }
    // 서브쿼리 카테고리
    subWhereClauses.push('sub.category ILIKE :category');
    // 서브쿼리 주소 필터
    addrs.forEach((_, i) => {
      subWhereClauses.push(`sub.address ILIKE :addr${i}`);
    });

    return await qb
      .select([
        'l.address AS "address"',
        `STRING_AGG(l.id::text, ',')    AS "ids"`,
        `STRING_AGG(l.lng::text, ',')   AS "lngs"`,
        `STRING_AGG(l.lat::text, ',')   AS "lats"`,
        `COUNT(l.id)                    AS "addressCount"`,
        `(
         SELECT COUNT(1)
         FROM myleisure.leisure sub
         WHERE ${subWhereClauses.join(' AND ')}
       )                              AS "totalCount"`,
      ])
      .groupBy('l.address')
      .setParameters(
        addrs.reduce((p, _, i) => ({ ...p, [`addr${i}`]: `%${addrs[i]}%` }), {
          term: payload.search,
          likeTerm: `%${payload.search}%`,
          category: payload.category ?? '%',
        }),
      )
      .getRawMany<{
        address: string;
        ids: string;
        lngs: string;
        lats: string;
        addressCount: number;
        totalCount: number;
      }>();
  }

  async searchPinedLeisure(id: number) {
    return this.leisureRepo.findOneOrFail({
      where: { id },
      select: {
        id: true,
        business_name: true,
        business_address: true,
        address: true,
        category: true,
        visitor_review_count: true,
        blog_review_count: true,
        business_photo: true,
        lat: true,
        lng: true,
        leisure_image: { image: true },
      },
    });
  }

  getSearchCount = async (payload: SearchType) => {
    try {
      return await this.searchCount(payload);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(500, 'search.service.getSearchCount: 서버 에러가 발생했습니다.');
    }
  };

  async getSearch(payload: SearchType) {
    try {
      const result = await this.search(payload);
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(500, 'search.service.getSearch: 서버 에러가 발생했습니다.');
    }
  }

  getSearchMap = async (payload: MapSearchType) => {
    try {
      return await this.searchMap(payload);
    } catch (e) {
      throw new InternalServerErrorException(500, 'search.service.getSearchMap: 서버 에러가 발생했습니다.');
    }
  };

  getMapPreviewLeisure = async (id: number) => {
    try {
      return await this.searchPinedLeisure(id);
    } catch (e) {
      throw new InternalServerErrorException(500, 'search.service.getMapPreviewLeisure: 서버 에러가 발생했습니다.');
    }
  };
}
