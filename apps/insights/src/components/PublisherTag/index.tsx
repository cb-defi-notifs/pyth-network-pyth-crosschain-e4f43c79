import { Broadcast } from "@phosphor-icons/react/dist/ssr/Broadcast";
import { Skeleton } from "@pythnetwork/component-library/Skeleton";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

import styles from "./index.module.scss";
import { PublisherKey } from "../PublisherKey";

type Props = ComponentProps<"div"> & { compact?: boolean | undefined } & (
    | { isLoading: true }
    | ({
        isLoading?: false;
        publisherKey: string;
      } & (
        | { name: string; icon: ReactNode }
        | { name?: undefined; icon?: undefined }
      ))
  );

export const PublisherTag = ({ className, ...props }: Props) => (
  <div
    data-loading={props.isLoading ? "" : undefined}
    data-compact={props.compact ? "" : undefined}
    className={clsx(styles.publisherTag, className)}
    {...omitKeys(props, [
      "compact",
      "isLoading",
      "publisherKey",
      "name",
      "icon",
    ])}
  >
    {props.isLoading ? (
      <Skeleton fill className={styles.icon} />
    ) : (
      <div className={styles.icon}>{props.icon ?? <UndisclosedIcon />}</div>
    )}
    <Contents {...props} />
  </div>
);

const UndisclosedIcon = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={clsx(styles.undisclosedIconWrapper, className)} {...props}>
    <Broadcast className={styles.undisclosedIcon} />
  </div>
);

const Contents = (props: Props) => {
  if (props.isLoading) {
    return <Skeleton width={30} />;
  } else if (props.compact) {
    return props.name ? (
      <div className={styles.name}>{props.name}</div>
    ) : (
      <PublisherKey publisherKey={props.publisherKey} size="xs" />
    );
  } else if (props.name) {
    return (
      <div className={styles.nameAndKey}>
        <div className={styles.name}>{props.name}</div>
        <PublisherKey
          className={styles.key ?? ""}
          publisherKey={props.publisherKey}
          size="xs"
        />
      </div>
    );
  } else {
    return <PublisherKey publisherKey={props.publisherKey} size="sm" />;
  }
};

const omitKeys = <T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
) => {
  const omitSet = new Set(keys);
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !omitSet.has(key)),
  );
};