'use client';

import {
  FC,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { TikTokDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { Select } from '@gitroom/react/form/select';
import { Checkbox } from '@gitroom/react/form/checkbox';
import clsx from 'clsx';
import { useIntegration } from '@gitroom/frontend/components/launches/helpers/use.integration';
import { Input } from '@gitroom/react/form/input';
import { TiktokPreview } from '@gitroom/frontend/components/new-launch/providers/tiktok/tiktok.preview';
import { useCustomProviderFunction } from '@gitroom/frontend/components/launches/helpers/use.custom.provider.function';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import useSWR from 'swr';

interface TikTokCreatorInfo {
  max_video_post_duration_sec: number;
  privacy_level_options: string[] | null;
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  creator_nickname: string | null;
  creator_username: string | null;
  creator_avatar_url: string | null;
  can_post: boolean;
  error_message?: string;
}

const CANNOT_POST_MESSAGE =
  'This TikTok creator cannot post right now. Please try again later.';

const COMMERCIAL_DISCLOSURE_TOOLTIP =
  'You need to indicate if your content promotes yourself, a third party, or both.';

const BRANDED_CONTENT_PRIVATE_TOOLTIP =
  'Branded content visibility cannot be set to private.';

const useTikTokCreatorInfo = () => {
  const { integration } = useIntegration();
  const customFunc = useCustomProviderFunction();
  return useSWR<TikTokCreatorInfo>(
    integration?.id ? `tiktok-creator-info-${integration.id}` : null,
    () => customFunc.get('getCreatorInfo')
  );
};

const PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: 'Public to everyone',
  MUTUAL_FOLLOW_FRIENDS: 'Mutual follow friends',
  FOLLOWER_OF_CREATOR: 'Follower of creator',
  SELF_ONLY: 'Self only',
};

const StepHeader: FC<{ step: number; title: string }> = ({ step, title }) => (
  <div className="flex items-center gap-[10px] mb-[12px]">
    <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#B69DEC] text-white text-[11px] font-bold shrink-0">
      {step}
    </div>
    <div className="font-semibold text-[14px] tracking-wide">{title}</div>
  </div>
);

const WarningIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 mt-[1px]"
  >
    <path
      d="M22.201 17.6335L14.0026 3.39569C13.7977 3.04687 13.5052 2.75764 13.1541 2.55668C12.803 2.35572 12.4055 2.25 12.001 2.25C11.5965 2.25 11.199 2.35572 10.8479 2.55668C10.4968 2.75764 10.2043 3.04687 9.99944 3.39569L1.80101 17.6335C1.60388 17.9709 1.5 18.3546 1.5 18.7454C1.5 19.1361 1.60388 19.5199 1.80101 19.8572C2.00325 20.2082 2.29523 20.499 2.64697 20.6998C2.99871 20.9006 3.39755 21.0043 3.80257 21.0001H20.1994C20.6041 21.0039 21.0026 20.9001 21.354 20.6993C21.7054 20.4985 21.997 20.2079 22.1991 19.8572C22.3965 19.52 22.5007 19.1364 22.5011 18.7456C22.5014 18.3549 22.3978 17.9711 22.201 17.6335ZM11.251 9.75006C11.251 9.55115 11.33 9.36038 11.4707 9.21973C11.6113 9.07908 11.8021 9.00006 12.001 9.00006C12.1999 9.00006 12.3907 9.07908 12.5313 9.21973C12.672 9.36038 12.751 9.55115 12.751 9.75006V13.5001C12.751 13.699 12.672 13.8897 12.5313 14.0304C12.3907 14.171 12.1999 14.2501 12.001 14.2501C11.8021 14.2501 11.6113 14.171 11.4707 14.0304C11.33 13.8897 11.251 13.699 11.251 13.5001V9.75006ZM12.001 18.0001C11.7785 18.0001 11.561 17.9341 11.376 17.8105C11.191 17.6868 11.0468 17.5111 10.9616 17.3056C10.8765 17.1 10.8542 16.8738 10.8976 16.6556C10.941 16.4374 11.0482 16.2369 11.2055 16.0796C11.3628 15.9222 11.5633 15.8151 11.7815 15.7717C11.9998 15.7283 12.226 15.7505 12.4315 15.8357C12.6371 15.9208 12.8128 16.065 12.9364 16.25C13.06 16.4351 13.126 16.6526 13.126 16.8751C13.126 17.1734 13.0075 17.4596 12.7965 17.6706C12.5855 17.8815 12.2994 18.0001 12.001 18.0001Z"
      fill="white"
    />
  </svg>
);

const MockBadge: FC = () => (
  <div className="flex items-center gap-[8px] bg-yellow-900/40 border border-yellow-600 rounded-[8px] p-[10px] mb-[16px] text-[12px] text-yellow-400">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
    <span>
      <strong>TikTok Mock Mode</strong> — no real upload will be sent to TikTok.
    </span>
  </div>
);

const TikTokSettings: FC<{ values?: any }> = () => {
  const { watch, register, setValue } = useSettings();
  const { integration, value } = useIntegration();
  const { data: creatorInfo, isLoading, error } = useTikTokCreatorInfo();
  const mediaDir = useMediaDirectory();
  const setDisabledPublish = useLaunchStore((s) => s.setDisabledPublish);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const isMock = integration?.name === 'TikTok Mock Account';

  const isTitle = useMemo(
    () => value?.[0]?.image?.some((p) => (p?.path?.indexOf?.('mp4') ?? -1) === -1),
    [value]
  );

  const disclose = watch('disclose');
  const brand_organic_toggle = watch('brand_organic_toggle');
  const brand_content_toggle = watch('brand_content_toggle');
  const content_posting_method = watch('content_posting_method');
  const privacy_level = watch('privacy_level');
  const isUploadMode = content_posting_method === 'UPLOAD';

  const videoPath = useMemo(() => {
    const mp4 = value?.[0]?.image?.find(
      (p: any) => (p?.path?.indexOf?.('mp4') ?? -1) > -1
    );
    return mp4?.path ?? null;
  }, [value]);

  const isVideoPost = !!videoPath;

  useEffect(() => {
    if (!videoPath) {
      setVideoDuration(null);
      return;
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = mediaDir.set(videoPath);
    video.onloadedmetadata = () => {
      setVideoDuration(Math.round(video.duration));
      video.src = '';
    };
    video.onerror = () => setVideoDuration(null);
  }, [videoPath]);

  useEffect(() => {
    if (!disclose) {
      setValue('brand_organic_toggle', false);
      setValue('brand_content_toggle', false);
    }
  }, [disclose, setValue]);

  // TikTok forbids "self only" / private visibility for branded content.
  // If the user already picked it before turning branded content on, clear
  // the now-invalid privacy value so they must pick a valid one.
  useEffect(() => {
    if (brand_content_toggle && privacy_level === 'SELF_ONLY') {
      setValue('privacy_level', '');
    }
  }, [brand_content_toggle, privacy_level, setValue]);

  const isCreatorInfoError =
    !!error ||
    (!isLoading && !!creatorInfo && !creatorInfo.privacy_level_options);

  const cannotPostNow = !isLoading && !!creatorInfo && creatorInfo.can_post === false;

  const exceedsMaxDuration =
    isVideoPost &&
    videoDuration !== null &&
    !!creatorInfo &&
    videoDuration > creatorInfo.max_video_post_duration_sec;

  const noBrandOptionSelected =
    disclose && !brand_organic_toggle && !brand_content_toggle;

  // Drives both the live "disabled publish" tooltip/state (via the launch
  // store, read by the global Publish/Schedule buttons) and the final
  // checkValidity gate below, so the two can never disagree.
  useEffect(() => {
    if (!integration?.id) return;

    const reason = cannotPostNow
      ? CANNOT_POST_MESSAGE
      : exceedsMaxDuration
      ? `Video is ${videoDuration}s, longer than the ${creatorInfo?.max_video_post_duration_sec}s allowed by this TikTok account.`
      : noBrandOptionSelected
      ? COMMERCIAL_DISCLOSURE_TOOLTIP
      : null;

    setDisabledPublish(integration.id, reason);

    return () => {
      setDisabledPublish(integration.id, null);
    };
  }, [
    integration?.id,
    cannotPostNow,
    exceedsMaxDuration,
    noBrandOptionSelected,
    videoDuration,
    creatorInfo?.max_video_post_duration_sec,
    setDisabledPublish,
  ]);

  const privacyOptions = useMemo(() => {
    if (!creatorInfo?.privacy_level_options) return null;
    return creatorInfo.privacy_level_options.map((val) => ({
      value: val,
      label: PRIVACY_LABELS[val] ?? val,
    }));
  }, [creatorInfo?.privacy_level_options]);

  const interactionRestrictions = useMemo(() => {
    if (!creatorInfo) return [];
    return [
      creatorInfo.comment_disabled && 'comments',
      !isVideoPost ? false : creatorInfo.duet_disabled && 'duets',
      !isVideoPost ? false : creatorInfo.stitch_disabled && 'stitches',
    ].filter(Boolean) as string[];
  }, [creatorInfo, isVideoPost]);

  const declarationText = brand_content_toggle ? (
    <span>
      By posting, you agree to TikTok&apos;s{' '}
      <a
        target="_blank"
        rel="noreferrer"
        className="text-[#B69DEC] hover:underline"
        href="https://www.tiktok.com/legal/page/global/bc-policy/en"
      >
        Branded Content Policy
      </a>{' '}
      and{' '}
      <a
        target="_blank"
        rel="noreferrer"
        className="text-[#B69DEC] hover:underline"
        href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
      >
        Music Usage Confirmation
      </a>
      .
    </span>
  ) : (
    <span>
      By posting, you agree to TikTok&apos;s{' '}
      <a
        target="_blank"
        rel="noreferrer"
        className="text-[#B69DEC] hover:underline"
        href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
      >
        Music Usage Confirmation
      </a>
      .
    </span>
  );

  return (
    <div className="flex flex-col">

      {isMock && <MockBadge />}

      {/* ── Step 1 — Creator Info ──────────────────────────────────── */}
      <StepHeader step={1} title="Creator Info" />

      {isLoading && (
        <div className="text-[13px] text-gray-400 mb-[12px]">
          Loading creator info from TikTok…
        </div>
      )}

      {isCreatorInfoError && (
        <div className="border border-red-600 rounded-[8px] p-[12px] mb-[12px] text-[13px] text-red-400">
          Unable to load TikTok privacy options. Please reconnect your TikTok
          account or try again later.
        </div>
      )}

      {cannotPostNow && (
        <div className="border border-red-600 rounded-[8px] p-[12px] mb-[12px] text-[13px] text-red-400">
          {CANNOT_POST_MESSAGE}
          {creatorInfo?.error_message ? ` (${creatorInfo.error_message})` : ''}
        </div>
      )}

      {!isLoading && !isCreatorInfoError && !cannotPostNow && creatorInfo && (
        <div className="bg-tableBorder rounded-[8px] p-[12px] mb-[12px] flex flex-col gap-[6px] text-[13px]">
          <div className="flex gap-[8px]">
            <span className="text-gray-400 shrink-0">Posting as:</span>
            <span className="font-semibold">
              {creatorInfo.creator_nickname ?? integration?.name ?? '—'}
            </span>
          </div>
          <div className="flex gap-[8px]">
            <span className="text-gray-400 shrink-0">Creator info:</span>
            <span className="text-green-400">Loaded from TikTok</span>
          </div>
          <div className="flex gap-[8px]">
            <span className="text-gray-400 shrink-0">Max video duration:</span>
            <span>{creatorInfo.max_video_post_duration_sec}s</span>
          </div>
          <div className="flex gap-[8px]">
            <span className="text-gray-400 shrink-0">Privacy options loaded:</span>
            <span>{creatorInfo.privacy_level_options?.length ?? 0} options</span>
          </div>
          {isVideoPost && (
            <>
              <div className="flex gap-[8px]">
                <span className="text-gray-400 shrink-0">Current video duration:</span>
                <span>{videoDuration !== null ? `${videoDuration}s` : '—'}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-gray-400 shrink-0">Duration check:</span>
                {videoDuration === null ? (
                  <span className="text-gray-400">—</span>
                ) : !exceedsMaxDuration ? (
                  <span className="text-green-400">Passed</span>
                ) : (
                  <span className="text-red-400">
                    Failed ({videoDuration}s &gt; {creatorInfo.max_video_post_duration_sec}s)
                  </span>
                )}
              </div>
            </>
          )}
          <div className="flex gap-[8px]">
            <span className="text-gray-400 shrink-0">Interaction restrictions:</span>
            <span>
              {interactionRestrictions.length > 0
                ? interactionRestrictions.join(', ')
                : 'none'}
            </span>
          </div>
        </div>
      )}

      {/* Stop the publishing attempt entirely when the creator can't post */}
      {!isLoading && (isCreatorInfoError || cannotPostNow) ? (
        <div className="text-[13px] text-gray-400 mb-[12px]">
          The rest of the TikTok publishing options are unavailable until this
          is resolved.
        </div>
      ) : (
        <>
          <hr className="mb-[20px] border-tableBorder" />

          {/* ── Step 2 — Metadata & Privacy ───────────────────────────── */}
          <StepHeader step={2} title="Metadata & Privacy" />

          {isTitle && <Input label="Title" {...register('title')} maxLength={89} />}

          {privacyOptions && (
            <>
              <Select
                label="Who can see this video? (required)"
                disabled={isUploadMode}
                {...register('privacy_level', { value: '' })}
              >
                <option value="">Select privacy</option>
                {privacyOptions.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    disabled={brand_content_toggle && item.value === 'SELF_ONLY'}
                    title={
                      brand_content_toggle && item.value === 'SELF_ONLY'
                        ? BRANDED_CONTENT_PRIVATE_TOOLTIP
                        : undefined
                    }
                  >
                    {item.label}
                    {brand_content_toggle && item.value === 'SELF_ONLY'
                      ? ' — not available for branded content'
                      : ''}
                  </option>
                ))}
              </Select>
              <div className="text-[12px] text-gray-400 -mt-[18px] mb-[16px]">
                Privacy options are loaded from TikTok creator_info. You must
                select a privacy level manually before publishing.
              </div>
              {brand_content_toggle && (
                <div
                  className="text-[12px] text-yellow-400 -mt-[12px] mb-[16px]"
                  title={BRANDED_CONTENT_PRIVATE_TOOLTIP}
                >
                  {BRANDED_CONTENT_PRIVATE_TOOLTIP}
                </div>
              )}
            </>
          )}

          <Select
            label="Content posting method"
            {...register('content_posting_method', { value: 'DIRECT_POST' })}
          >
            <option value="">Select</option>
            <option value="DIRECT_POST">Post content directly to TikTok</option>
            <option value="UPLOAD">
              Upload content to TikTok without posting it
            </option>
          </Select>
          <div className="text-[13px] mt-[6px] mb-[16px] text-balance text-gray-400">
            Choose upload without posting to review and edit in TikTok&apos;s app
            before publishing.
          </div>
          {isUploadMode && (
            <div className="-mt-[10px] mb-[16px] text-red-500 text-[13px]">
              After posting you will find a notification inside your Inbox (not
              Content Studio).
            </div>
          )}

          {!isTitle && (
            <>
              <Select
                label="Auto add music"
                {...register('autoAddMusic', { value: 'no' })}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
              <div className="text-[13px] mt-[6px] mb-[16px] text-balance text-gray-400">
                Available for photos only. Adds a default music track you can
                change later.
              </div>
            </>
          )}

          <hr className="mb-[20px] border-tableBorder" />

          {/* ── Step 3 — Interaction Settings ─────────────────────────── */}
          <StepHeader step={3} title="Interaction Settings" />
          <div className="text-[13px] mb-[12px] text-gray-400">
            All options are disabled by default. Enable them manually if needed.
          </div>
          <div className="flex gap-[40px] mb-[8px]">
            <Checkbox
              label="Allow comments"
              variant="hollow"
              disabled={isUploadMode || !!creatorInfo?.comment_disabled}
              {...register('comment', { value: false })}
            />
            {isVideoPost && (
              <>
                <Checkbox
                  variant="hollow"
                  label="Allow duet"
                  disabled={isUploadMode || !!creatorInfo?.duet_disabled}
                  {...register('duet', { value: false })}
                />
                <Checkbox
                  label="Allow stitch"
                  variant="hollow"
                  disabled={isUploadMode || !!creatorInfo?.stitch_disabled}
                  {...register('stitch', { value: false })}
                />
              </>
            )}
          </div>
          {interactionRestrictions.length > 0 && (
            <div className="text-[12px] text-yellow-400 mb-[12px]">
              {interactionRestrictions.join(', ')} disabled by TikTok for this
              creator/account.
            </div>
          )}

          <hr className="mb-[20px] border-tableBorder" />

          {/* ── Step 4 — Commercial Content Disclosure ────────────────── */}
          <StepHeader step={4} title="Commercial Content Disclosure" />

          <div className="flex flex-col gap-[4px]">
            <Checkbox
              label="Commercial content disclosure"
              variant="hollow"
              disabled={isUploadMode}
              {...register('disclose', { value: false })}
            />
            <div className="text-[13px] text-gray-400 text-balance">
              Indicate whether this content promotes yourself, a brand, product
              or service.
            </div>
          </div>

          <div className="mt-[12px]">
            <Checkbox
              label="Video made with AI"
              variant="hollow"
              {...register('video_made_with_ai', { value: false })}
            />
          </div>

          <div
            className={clsx(
              !disclose && 'invisible h-0 overflow-hidden',
              'mt-[16px] flex flex-col gap-[12px]'
            )}
          >
            <Checkbox
              variant="hollow"
              label="Your brand"
              disabled={isUploadMode}
              {...register('brand_organic_toggle', { value: false })}
            />
            <Checkbox
              variant="hollow"
              label="Branded content"
              disabled={isUploadMode}
              {...register('brand_content_toggle', { value: false })}
            />

            {(brand_organic_toggle || brand_content_toggle) && (
              <div className="bg-tableBorder p-[10px] rounded-[8px] flex gap-[12px] items-start text-[13px] border border-[#B69DEC]">
                <WarningIcon />
                <div className="font-semibold">
                  {brand_content_toggle
                    ? `Your photo/video will be labeled as "Paid partnership"`
                    : `Your photo/video will be labeled as "Promotional content"`}
                  <br />
                  <span className="font-normal">
                    This cannot be changed once your video is posted.
                  </span>
                </div>
              </div>
            )}

            {noBrandOptionSelected && (
              <div
                className="text-[13px] text-red-400 mt-[4px]"
                title={COMMERCIAL_DISCLOSURE_TOOLTIP}
              >
                {COMMERCIAL_DISCLOSURE_TOOLTIP}
              </div>
            )}
          </div>

          <hr className="my-[20px] border-tableBorder" />

          {/* ── Step 5 — Consent & Publish ────────────────────────────── */}
          <StepHeader step={5} title="Consent & Publish" />

          <div className="bg-tableBorder rounded-[8px] p-[12px] mb-[12px] text-[13px]">
            {declarationText}
          </div>

          <div className="text-[12px] text-gray-400 mb-[8px]">
            The upload to TikTok starts only after the user clicks &quot;Publish to
            TikTok&quot;.
          </div>

          <div className="text-[12px] text-gray-400">
            After publishing, it may take a few minutes for TikTok to process
            your content before it becomes visible on your profile.
          </div>
        </>
      )}
    </div>
  );
};

export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: TikTokSettings,
  comments: false,
  CustomPreviewComponent: TiktokPreview,
  dto: TikTokDto,
  checkValidity: async (items, settings: any, _additionalSettings, integrationId) => {
    const [firstItems] = items ?? [];
    if ((firstItems?.length ?? 0) === 0) {
      return 'No video / images selected';
    }
    if (
      (firstItems?.length ?? 0) > 1 &&
      firstItems?.some((p) => (p?.path?.indexOf?.('mp4') ?? -1) > -1)
    ) {
      return 'Only pictures are supported when selecting multiple items';
    } else if (
      firstItems?.length !== 1 &&
      (firstItems?.[0]?.path?.indexOf?.('mp4') ?? -1) > -1
    ) {
      return 'You need one media';
    }

    // Picks up the creator-can't-post / max-duration / commercial-disclosure
    // checks that are computed live inside TikTokSettings, so the click-time
    // gate always matches what's shown in the settings panel.
    if (integrationId) {
      const liveReason = useLaunchStore.getState().disabledPublish[integrationId];
      if (liveReason) {
        return liveReason;
      }
    }

    if (!settings.privacy_level) {
      return 'Privacy level is required — please select a privacy option from the TikTok section';
    }

    if (
      settings.disclose &&
      !settings.brand_organic_toggle &&
      !settings.brand_content_toggle
    ) {
      return COMMERCIAL_DISCLOSURE_TOOLTIP;
    }

    if (
      settings.brand_content_toggle &&
      settings.privacy_level === 'SELF_ONLY'
    ) {
      return BRANDED_CONTENT_PRIVATE_TOOLTIP;
    }

    return true;
  },
  maximumCharacters: 2000,
});
