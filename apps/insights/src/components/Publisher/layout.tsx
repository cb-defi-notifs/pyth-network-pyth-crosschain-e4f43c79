import { BookOpenText } from "@phosphor-icons/react/dist/ssr/BookOpenText";
import { Browsers } from "@phosphor-icons/react/dist/ssr/Browsers";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { Lightbulb } from "@phosphor-icons/react/dist/ssr/Lightbulb";
import { Ranking } from "@phosphor-icons/react/dist/ssr/Ranking";
import { ShieldChevron } from "@phosphor-icons/react/dist/ssr/ShieldChevron";
import { Alert, AlertTrigger } from "@pythnetwork/component-library/Alert";
import { Badge } from "@pythnetwork/component-library/Badge";
import { Breadcrumbs } from "@pythnetwork/component-library/Breadcrumbs";
import { Button } from "@pythnetwork/component-library/Button";
import { DrawerTrigger, Drawer } from "@pythnetwork/component-library/Drawer";
import { InfoBox } from "@pythnetwork/component-library/InfoBox";
import { StatCard } from "@pythnetwork/component-library/StatCard";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ActiveFeedsCard } from "./active-feeds-card";
import { ChartCard } from "./chart-card";
import styles from "./layout.module.scss";
import { MedianScoreHistory } from "./median-score-history";
import { OisApyHistory } from "./ois-apy-history";
import {
  getPublishers,
  getPublisherFeeds,
  getPublisherRankingHistory,
  getPublisherMedianScoreHistory,
} from "../../services/clickhouse";
import { getPublisherCaps } from "../../services/hermes";
import { getTotalFeedCount } from "../../services/pyth";
import { getPublisherPoolData } from "../../services/staking";
import { ChangeValue } from "../ChangeValue";
import { FormattedDate } from "../FormattedDate";
import { FormattedNumber } from "../FormattedNumber";
import { FormattedTokens } from "../FormattedTokens";
import { Meter } from "../Meter";
import { PublisherKey } from "../PublisherKey";
import { PublisherTag } from "../PublisherTag";
import { SemicircleMeter } from "../SemicircleMeter";
import { TabPanel, TabRoot, Tabs } from "../Tabs";
import { TokenIcon } from "../TokenIcon";

type Props = {
  children: ReactNode;
  params: Promise<{
    key: string;
  }>;
};

export const PublishersLayout = async ({ children, params }: Props) => {
  const { key } = await params;
  const [
    publishers,
    rankingHistory,
    medianScoreHistory,
    totalFeedsCount,
    oisStats,
    publisherFeeds,
  ] = await Promise.all([
    getPublishers(),
    getPublisherRankingHistory(key),
    getPublisherMedianScoreHistory(key),
    getTotalFeedCount(),
    getOisStats(key),
    getPublisherFeeds(key),
  ]);

  const publisher = publishers.find((publisher) => publisher.key === key);

  const currentRanking = rankingHistory.at(-1);
  const previousRanking = rankingHistory.at(-2);

  const currentMedianScore = medianScoreHistory.at(-1);
  const previousMedianScore = medianScoreHistory.at(-2);

  return currentRanking && currentMedianScore && publisher ? (
    <div className={styles.publisherLayout}>
      <section className={styles.header}>
        <div className={styles.headerRow}>
          <Breadcrumbs
            className={styles.breadcrumbs ?? ""}
            label="Breadcrumbs"
            items={[
              { href: "/", label: "Home" },
              { href: "/publishers", label: "Publishers" },
              { label: <PublisherKey size="sm" publisherKey={key} /> },
            ]}
          />
        </div>
        <div className={styles.headerRow}>
          <PublisherTag publisherKey={key} />
        </div>
        <section className={styles.stats}>
          <ChartCard
            variant="primary"
            header="Publisher Ranking"
            lineClassName={styles.primarySparkChartLine}
            corner={
              <AlertTrigger>
                <Button
                  variant="ghost"
                  size="xs"
                  beforeIcon={(props) => <Info weight="fill" {...props} />}
                  rounded
                  hideText
                  className={styles.publisherRankingExplainButton ?? ""}
                >
                  Explain Publisher Ranking
                </Button>
                <Alert title="Publisher Ranking" icon={<Lightbulb />}>
                  <p className={styles.publisherRankingExplainDescription}>
                    Each <b>Publisher</b> receives a <b>Ranking</b> which is
                    derived from the number of price feeds the <b>Publisher</b>{" "}
                    is actively publishing.
                  </p>
                </Alert>
              </AlertTrigger>
            }
            data={rankingHistory.map(({ timestamp, rank }) => ({
              x: timestamp,
              y: rank,
              displayX: (
                <span className={styles.activeDate}>
                  <FormattedDate value={timestamp} />
                </span>
              ),
            }))}
            stat={currentRanking.rank}
            {...(previousRanking && {
              miniStat: (
                <ChangeValue
                  direction={getChangeDirection(
                    currentRanking.rank,
                    previousRanking.rank,
                  )}
                >
                  {Math.abs(currentRanking.rank - previousRanking.rank)}
                </ChangeValue>
              ),
            })}
          />
          <DrawerTrigger>
            <ChartCard
              header="Median Score"
              chartClassName={styles.medianScoreChart}
              lineClassName={styles.secondarySparkChartLine}
              corner={<Info weight="fill" />}
              data={medianScoreHistory.map(({ time, medianScore }) => ({
                x: time,
                y: medianScore,
                displayX: (
                  <span className={styles.activeDate}>
                    <FormattedDate value={time} />
                  </span>
                ),
                displayY: (
                  <FormattedNumber
                    maximumSignificantDigits={5}
                    value={medianScore}
                  />
                ),
              }))}
              stat={
                <FormattedNumber
                  maximumSignificantDigits={5}
                  value={currentMedianScore.medianScore}
                />
              }
              {...(previousMedianScore && {
                miniStat: (
                  <ChangeValue
                    direction={getChangeDirection(
                      previousMedianScore.medianScore,
                      currentMedianScore.medianScore,
                    )}
                  >
                    <FormattedNumber
                      maximumSignificantDigits={2}
                      value={
                        (100 *
                          Math.abs(
                            currentMedianScore.medianScore -
                              previousMedianScore.medianScore,
                          )) /
                        previousMedianScore.medianScore
                      }
                    />
                    %
                  </ChangeValue>
                ),
              })}
            />
            <Drawer
              title="Median Score"
              className={styles.medianScoreDrawer ?? ""}
              bodyClassName={styles.medianScoreDrawerBody}
              footerClassName={styles.medianScoreDrawerFooter}
              footer={
                <Button
                  variant="outline"
                  size="sm"
                  href="https://docs.pyth.network/home/oracle-integrity-staking/publisher-quality-ranking"
                  target="_blank"
                  beforeIcon={BookOpenText}
                >
                  Documentation
                </Button>
              }
            >
              <MedianScoreHistory medianScoreHistory={medianScoreHistory} />
              <InfoBox icon={<Ranking />} header="Publisher Score">
                Each price feed a publisher provides has an associated score,
                which is determined by the component{"'"}s uptime, price
                deviation, and staleness. This panel shows the median for each
                score across all price feeds published by this publisher, as
                well as the overall median score across all those feeds.
              </InfoBox>
            </Drawer>
          </DrawerTrigger>
          <ActiveFeedsCard
            publisherKey={key}
            activeFeeds={publisher.numSymbols}
            totalFeeds={totalFeedsCount}
          />
          <DrawerTrigger>
            <StatCard
              header="OIS Pool Allocation"
              stat={
                <span
                  className={styles.oisAllocation}
                  data-is-overallocated={
                    Number(oisStats.poolUtilization) > oisStats.maxPoolSize
                      ? ""
                      : undefined
                  }
                >
                  <FormattedNumber
                    maximumFractionDigits={2}
                    value={
                      (100 * Number(oisStats.poolUtilization)) /
                      oisStats.maxPoolSize
                    }
                  />
                  %
                </span>
              }
              corner={<Info weight="fill" />}
            >
              <Meter
                value={Number(oisStats.poolUtilization)}
                maxValue={oisStats.maxPoolSize}
                label="OIS Pool"
                startLabel={
                  <span className={styles.tokens}>
                    <TokenIcon />
                    <span>
                      <FormattedTokens tokens={oisStats.poolUtilization} />
                    </span>
                  </span>
                }
                endLabel={
                  <span className={styles.tokens}>
                    <TokenIcon />
                    <span>
                      <FormattedTokens tokens={BigInt(oisStats.maxPoolSize)} />
                    </span>
                  </span>
                }
              />
            </StatCard>
            <Drawer
              title="OIS Pool Allocation"
              className={styles.oisDrawer ?? ""}
              bodyClassName={styles.oisDrawerBody}
              footerClassName={styles.oisDrawerFooter}
              footer={
                <>
                  <Button
                    variant="solid"
                    size="sm"
                    href="https://staking.pyth.network"
                    target="_blank"
                    beforeIcon={Browsers}
                  >
                    Open Staking App
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    href="https://docs.pyth.network/home/oracle-integrity-staking"
                    target="_blank"
                    beforeIcon={BookOpenText}
                  >
                    Documentation
                  </Button>
                </>
              }
            >
              <SemicircleMeter
                width={420}
                height={420}
                value={Number(oisStats.poolUtilization)}
                maxValue={oisStats.maxPoolSize}
                className={styles.oisMeter ?? ""}
                aria-label="OIS Pool Utilization"
              >
                <TokenIcon className={styles.oisMeterIcon} />
                <div className={styles.oisMeterLabel}>OIS Pool</div>
              </SemicircleMeter>
              <StatCard
                header="Total Staked"
                variant="secondary"
                nonInteractive
                stat={
                  <>
                    <TokenIcon />
                    <FormattedTokens tokens={oisStats.poolUtilization} />
                  </>
                }
              />
              <StatCard
                header="Pool Capacity"
                variant="secondary"
                nonInteractive
                stat={
                  <>
                    <TokenIcon />
                    <FormattedTokens tokens={BigInt(oisStats.maxPoolSize)} />
                  </>
                }
              />
              <OisApyHistory apyHistory={oisStats.apyHistory ?? []} />
              <InfoBox
                icon={<ShieldChevron />}
                header="Oracle Integrity Staking (OIS)"
              >
                OIS allows anyone to help secure Pyth and protect DeFi. Through
                decentralized staking rewards and slashing, OIS incentivizes
                Pyth publishers to maintain high-quality data contributions.
                PYTH holders can stake to publishers to further reinforce oracle
                security. Rewards are programmatically distributed to high
                quality publishers and the stakers supporting them to strengthen
                oracle integrity.
              </InfoBox>
            </Drawer>
          </DrawerTrigger>
        </section>
      </section>
      <TabRoot>
        <Tabs
          label="Price Feed Navigation"
          prefix={`/publishers/${key}`}
          items={[
            { segment: undefined, children: "Performance" },
            {
              segment: "price-feeds",
              children: (
                <div className={styles.priceFeedsTabLabel}>
                  <span>Price Feeds</span>
                  <Badge size="xs" style="filled" variant="neutral">
                    {publisherFeeds.length}
                  </Badge>
                </div>
              ),
            },
          ]}
        />
        <TabPanel className={styles.body ?? ""}>{children}</TabPanel>
      </TabRoot>
    </div>
  ) : (
    notFound()
  );
};

const getChangeDirection = (previousValue: number, currentValue: number) => {
  if (currentValue < previousValue) {
    return "down";
  } else if (currentValue > previousValue) {
    return "up";
  } else {
    return "flat";
  }
};

const getOisStats = async (key: string) => {
  const [publisherPoolData, publisherCaps] = await Promise.all([
    getPublisherPoolData(),
    getPublisherCaps(),
  ]);

  const publisher = publisherPoolData.find(
    (publisher) => publisher.pubkey === key,
  );

  return {
    apyHistory: publisher?.apyHistory,
    poolUtilization:
      (publisher?.totalDelegation ?? 0n) +
      (publisher?.totalDelegationDelta ?? 0n),
    maxPoolSize:
      publisherCaps.parsed?.[0]?.publisher_stake_caps.find(
        ({ publisher }) => publisher === key,
      )?.cap ?? 0,
  };
};
