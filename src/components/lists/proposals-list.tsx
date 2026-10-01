import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ProposalCard } from "@/components/cards/proposal-card";
import { ProposalGenericSheet } from "@/components/filters/generic-sheet";
import { MultiSelectSheet } from "@/components/filters/multi-select-sheet";
import { ResultList } from "@/components/lists/result-list";
import { FilterRow } from "@/components/ui/filter-pill";
import { ScreenTitle } from "@/components/ui/screen";
import { SearchField } from "@/components/ui/search-field";
import { isoToDotDate } from "@/lib/date";
import {
  emptyProposalFilters,
  govProposalsQuery,
  proposalFilterCounts,
} from "@/lib/filter-query";
import { somes } from "@/lib/somes";
import { useCountry } from "@/lib/use-country";
import { useDebounced } from "@/lib/use-debounced";
import { useLocale } from "@/lib/use-locale";

import { useFilterSources, withCount, type Sheet } from "./filter-sources";

type Props = {
  control: ReactNode;
};

export function ProposalsList({ control }: Props) {
  const { t } = useTranslation("votes");
  const locale = useLocale();
  const country = useCountry();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(() => emptyProposalFilters(country));
  const [sheet, setSheet] = useState<Sheet>(null);

  const debouncedSearch = useDebounced(search);
  const query = govProposalsQuery(filters, debouncedSearch, 1);

  const results = useInfiniteQuery({
    queryKey: ["gov-proposals", query],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      somes.govProposals.search(
        govProposalsQuery(filters, debouncedSearch, pageParam),
      ),
    getNextPageParam: (last, pages) =>
      pages.length < last.max_page ? pages.length + 1 : undefined,
  });

  const { topics, periods } = useFilterSources();

  const ministries = useQuery({
    queryKey: ["departments-per-gp"],
    queryFn: () => somes.reference.departmentsPerGp(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const counts = proposalFilterCounts(filters);
  const items = results.data?.pages.flatMap((page) => page.gov_proposals) ?? [];
  const updatedAt = results.data?.pages[0]?.updated_at;

  const header = (
    <>
      {control}

      <ScreenTitle
        title={t("proposalsList.title")}
        subtitle={
          updatedAt
            ? t("delegates:list.updatedAt", {
                date: isoToDotDate(updatedAt, locale),
              })
            : undefined
        }
        centered
      />

      <SearchField value={search} onChangeText={setSearch} />

      <FilterRow
        pills={[
          {
            key: "topics",
            label: withCount(t("proposalsList.filterTopics"), counts.topics),
            onPress: () => setSheet("topics"),
          },
          {
            key: "second",
            label: withCount(
              t("proposalsList.filterMinistries"),
              counts.ministries,
            ),
            onPress: () => setSheet("second"),
          },
          {
            key: "generic",
            label: withCount(t("proposalsList.filterGeneric"), counts.generic),
            onPress: () => setSheet("generic"),
          },
        ]}
      />
    </>
  );

  return (
    <>
      <ResultList
        header={header}
        items={items}
        keyExtractor={(proposal) =>
          String(proposal.gov_proposal.ministrial_proposal.id)
        }
        renderItem={(proposal) => <ProposalCard proposal={proposal} />}
        isPending={results.isPending}
        isError={results.isError}
        errorMessage={t("proposalsList.error")}
        emptyMessage={t("proposalsList.empty")}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage)
            results.fetchNextPage();
        }}
        isFetchingNextPage={results.isFetchingNextPage}
        refreshing={results.isRefetching && !results.isFetchingNextPage}
        onRefresh={() => results.refetch()}
      />

      <MultiSelectSheet
        visible={sheet === "topics"}
        title={t("proposalsList.filterTopics")}
        values={topics}
        selected={filters.topics}
        onChange={(selected) => setFilters({ ...filters, topics: selected })}
        onClose={() => setSheet(null)}
        searchable
        searchPlaceholder={t("search.topicPlaceholder")}
      />

      <MultiSelectSheet
        visible={sheet === "second"}
        title={t("proposalsList.filterMinistries")}
        values={ministriesFor(ministries.data, filters.gp)}
        selected={filters.departments}
        onChange={(departments) => setFilters({ ...filters, departments })}
        onClose={() => setSheet(null)}
        searchable
        searchPlaceholder={t("proposalsList.searchMinistry")}
      />

      <ProposalGenericSheet
        visible={sheet === "generic"}
        periods={periods}
        filters={filters}
        onChange={setFilters}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

/** ministries of the selected period, alle dedupes newest first across renames */
function ministriesFor(
  departmentsPerGp: Record<string, string[]> | undefined,
  gp: string | null,
): string[] {
  if (!departmentsPerGp) return [];
  if (gp) return departmentsPerGp[gp] ?? [];

  const seen = new Set<string>();
  Object.keys(departmentsPerGp)
    .sort()
    .reverse()
    .forEach((key) =>
      departmentsPerGp[key].forEach((department) => seen.add(department)),
    );
  return [...seen];
}
