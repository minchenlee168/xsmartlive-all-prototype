<template>
  <!-- 收單來源 Dialog 串流：source → post → fb-post / ig-post / group -->
  <Dialog
    v-model:visible="innerVisible"
    modal :draggable="false" :show-header="false" :dismissable-mask="true"
    :style="{ width: dialogWidth }"
    :pt="{ content: { style: 'padding: 0; border-radius: 12px; overflow: hidden;' } }"
    @update:visible="onVisibleChange">

    <!-- ── Header（共用） ─────────────────────────── -->
    <div class="flex items-center gap-3 px-[17.5px] py-[17.5px]">
      <p class="font-semibold text-[var(--p-text-color)] shrink-0" style="font-size:17.5px">{{ headerTitle }}</p>
      <button @click="close" class="w-[35px] py-[7px] flex items-center justify-center rounded-[6px] hover:bg-[var(--p-content-hover-background)] shrink-0 ml-auto">
        <i class="pi pi-times text-[14px] text-[var(--p-text-color)]"></i>
      </button>
    </div>

    <!-- ── Step 1：選擇收單來源 ──────────────────── -->
    <div v-if="step === 'source'" class="px-[17.5px] pb-[17.5px]">
      <div class="flex gap-4 items-stretch">
        <button v-for="opt in sourceOptions" :key="opt.key" @click="onSourcePick(opt.key)"
          class="flex-1 bg-[var(--p-content-background)] border border-[var(--p-content-border-color)] rounded-[6px] px-[13px] py-[17px] flex flex-col items-start gap-5 min-h-[352px] relative overflow-hidden hover:border-[var(--p-primary-color)] transition-colors text-left">
          <!-- Top：小 icon + 標題 -->
          <div class="flex gap-2 items-center">
            <div class="bg-[var(--p-primary-color)] rounded-[6px] w-12 h-12 flex items-center justify-center shrink-0">
              <i :class="opt.topIcon" class="text-white" style="font-size:24px"></i>
            </div>
            <span class="font-bold text-[24px] leading-6 text-[var(--p-text-color)] whitespace-nowrap">{{ opt.title }}</span>
          </div>
          <!-- 副標 -->
          <p class="text-[14px] leading-5 text-[var(--p-text-muted-color)]">{{ opt.desc }}</p>
          <!-- 大裝飾 icon（淡紫，靠右對齊） -->
          <div class="flex-1 w-full flex items-center justify-end pr-2">
            <i :class="opt.centerIcon" class="text-[#e9d5ff]" style="font-size:130px"></i>
          </div>
          <!-- 立即建立（置中） -->
          <div class="self-center border border-[var(--p-primary-300)] rounded-[6px] px-[13.25px] py-[9.75px] flex gap-[7px] items-center">
            <span class="text-[var(--p-primary-color)] text-[15.75px] font-medium">{{ t('live_order.label.create_now') }}</span>
            <i class="pi pi-angle-right text-[var(--p-primary-color)]" style="font-size:15.75px"></i>
          </div>
        </button>
      </div>
    </div>

    <!-- ── Step 2：貼文收單來源（FB / IG） ────────── -->
    <div v-else-if="step === 'post'" class="px-[17.5px] pb-[17.5px]">
      <div class="flex gap-4 items-center">
        <button @click="step = 'fb-post'"
          class="relative w-[314px] h-[156px] rounded-[6px] px-3 py-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden bg-gradient-to-r from-[#dbeafe] to-white hover:brightness-95 transition">
          <div class="flex flex-col gap-2 items-start h-full">
            <div class="flex gap-2 items-center">
              <i class="fa-brands fa-facebook text-[#1877f2]" style="font-size:22px"></i>
              <p class="text-[16px] leading-6 text-[var(--p-text-color)]">{{ t('live_order.source_option.fb_title') }}</p>
            </div>
            <p class="text-[14px] leading-5 text-[var(--p-text-muted-color)] text-left">{{ t('live_order.source_option.fb_desc') }}</p>
            <div class="mt-auto bg-[#1877f2] rounded-[6px] px-[13.25px] py-[9.75px] flex gap-[7px] items-center">
              <span class="text-white text-[15.75px] font-medium">{{ t('live_order.label.create_now') }}</span>
              <i class="pi pi-angle-right text-white" style="font-size:15.75px"></i>
            </div>
          </div>
        </button>

        <button @click="step = 'ig-post'"
          class="relative w-[314px] h-[156px] rounded-[6px] px-3 py-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden bg-gradient-to-r from-[#fce7f3] to-white hover:brightness-95 transition">
          <div class="flex flex-col gap-2 items-start h-full">
            <div class="flex gap-2 items-center">
              <i class="fa-brands fa-instagram text-[#db2777]" style="font-size:22px"></i>
              <p class="text-[16px] leading-6 text-[var(--p-text-color)]">{{ t('live_order.source_option.ig_title') }}</p>
            </div>
            <p class="text-[14px] leading-5 text-[var(--p-text-muted-color)] text-left">{{ t('live_order.source_option.ig_desc') }}</p>
            <div class="mt-auto bg-[#db2777] rounded-[6px] px-[13.25px] py-[9.75px] flex gap-[7px] items-center">
              <span class="text-white text-[15.75px] font-medium">{{ t('live_order.label.create_now') }}</span>
              <i class="pi pi-angle-right text-white" style="font-size:15.75px"></i>
            </div>
          </div>
        </button>
      </div>
      <!-- footer：只有「返回」 -->
      <div class="flex gap-[7px] items-center justify-end pt-3">
        <button @click="step = 'source'"
          class="bg-[var(--p-content-hover-background)] border border-[var(--p-content-border-color)] px-[11.5px] py-[8px] rounded-[6px] text-[14px] font-medium text-[var(--p-text-color)] hover:bg-[var(--p-content-border-color)]">{{ t('live_order.button.back') }}</button>
      </div>
    </div>

    <!-- ── Step 3 / 4：FB / IG 貼文挑選 ─────────────── -->
    <div v-else-if="step === 'fb-post' || step === 'ig-post'" class="px-[17.5px] pb-[17.5px]">
      <div class="flex flex-col gap-4">

        <!-- 標題列：左 label + 右平台 Tag -->
        <div class="flex items-center justify-between">
          <p class="text-[14px] font-medium text-[var(--p-text-color)]">{{ t('live_order.label.from_existing_posts') }} <span class="text-[var(--p-text-muted-color)]">{{ t('live_order.label.pick_one_post_hint') }}</span></p>
          <div v-if="step === 'fb-post'" class="bg-[#dbeafe] flex items-center gap-[3.5px] px-[7px] py-[3.5px] rounded-[12px]">
            <i class="fa-brands fa-facebook text-[#3b82f6]" style="font-size:10.5px"></i>
            <span class="font-bold text-[12.25px] text-[#3b82f6]">{{ t('live_order.label.facebook') }}</span>
          </div>
          <div v-else class="bg-[#fce7f3] flex items-center gap-[3.5px] px-[7px] py-[3.5px] rounded-[12px]">
            <i class="fa-brands fa-instagram text-[#ec4899]" style="font-size:10.5px"></i>
            <span class="font-bold text-[12.25px] text-[#ec4899]">{{ t('live_order.label.instagram') }}</span>
          </div>
        </div>

        <!-- 貼文卡片 grid（5 × 2，外層可垂直捲動）-->
        <div class="h-[325px] overflow-y-auto overflow-x-hidden grid grid-cols-5 gap-2">
          <PostCard v-for="post in placeholderPosts" :key="post.id" :title="post.title" :date="post.date"
            :selected="selectedPostId === post.id"
            :disabled="usedPostIds.includes(post.id)"
            :used-label="t('live_order.label.used')"
            @click="selectedPostId = post.id" />
        </div>

        <!-- 分隔線「或是」 -->
        <div class="flex items-center w-full">
          <div class="flex-1 h-px bg-[var(--p-content-border-color)]"></div>
          <span class="px-6 text-[14px] font-medium text-[var(--p-text-color)]">{{ t('live_order.label.or') }}</span>
          <div class="flex-1 h-px bg-[var(--p-content-border-color)]"></div>
        </div>

        <!-- 直接貼上連結 -->
        <div class="flex flex-col gap-2 w-full">
          <span class="text-[14px] font-medium text-[var(--p-text-color)]">{{ t('live_order.label.paste_link') }}</span>
          <IconField icon-position="left">
            <InputIcon><i class="pi pi-link text-[14px]"></i></InputIcon>
            <InputText v-model="pasteUrl" :placeholder="step === 'fb-post' ? t('live_order.form.placeholder.fb_post_url') : t('live_order.form.placeholder.ig_post_url')" class="w-full" />
          </IconField>
        </div>
      </div>

      <!-- footer -->
      <div class="flex gap-[7px] items-center justify-end pt-4">
        <button @click="step = 'post'"
          class="bg-[var(--p-content-hover-background)] border border-[var(--p-content-border-color)] px-[11.5px] py-[8px] rounded-[6px] text-[14px] font-medium text-[var(--p-text-color)] hover:bg-[var(--p-content-border-color)]">{{ t('live_order.button.back') }}</button>
        <button @click="confirmPost"
          class="bg-[var(--p-primary-color)] border border-[var(--p-primary-color)] px-[11.5px] py-[8px] rounded-[6px] text-[14px] font-medium text-white hover:bg-[var(--p-primary-hover-color)]">{{ t('live_order.button.confirm') }}</button>
      </div>
    </div>

    <!-- ── Step 5：社團選擇 ─────────────────────────── -->
    <div v-else-if="step === 'group'" class="px-[17.5px] pb-[17.5px]">
      <div class="flex flex-col gap-4">
        <p class="text-[14px] font-medium text-[var(--p-text-color)]">{{ t('live_order.label.from_existing_groups') }}</p>
        <div class="h-[325px] overflow-y-auto overflow-x-hidden grid grid-cols-5 gap-2">
          <PostCard v-for="group in placeholderGroups" :key="group.id" :title="group.title" :date="group.date"
            :selected="selectedGroupId === group.id"
            :disabled="usedGroupIds.includes(group.id)"
            :used-label="t('live_order.label.used')"
            @click="selectedGroupId = group.id" />
        </div>
      </div>

      <div class="flex gap-[7px] items-center justify-end pt-4">
        <button @click="step = 'source'"
          class="bg-[var(--p-content-hover-background)] border border-[var(--p-content-border-color)] px-[11.5px] py-[8px] rounded-[6px] text-[14px] font-medium text-[var(--p-text-color)] hover:bg-[var(--p-content-border-color)]">{{ t('live_order.button.back') }}</button>
        <button @click="confirmGroup"
          class="bg-[var(--p-primary-color)] border border-[var(--p-primary-color)] px-[11.5px] py-[8px] rounded-[6px] text-[14px] font-medium text-white hover:bg-[var(--p-primary-hover-color)]">{{ t('live_order.button.confirm') }}</button>
      </div>
    </div>

  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, type FunctionalComponent } from 'vue'
import { useI18n } from 'vue-i18n'

interface PostCardProps {
  title: string
  date: string
  selected?: boolean
  disabled?: boolean
  usedLabel?: string
}

// 子元件：貼文 / 社團縮圖卡（佔位：純色 + 標題文字）
const PostCard: FunctionalComponent<PostCardProps, { click: [] }> = (props, { emit }) => h('button', {
  disabled: props.disabled,
  class: [
    'w-full rounded-[12px] overflow-hidden text-left transition flex items-end relative h-[188px]',
    'bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#fda4af]',
    'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]',
    props.disabled
      ? 'opacity-50 cursor-not-allowed grayscale'
      : (props.selected ? 'ring-2 ring-[var(--p-primary-color)]' : 'hover:brightness-95'),
  ],
  onClick: () => { if (!props.disabled) emit('click') },
}, [
  h('div', { class: 'absolute inset-0 flex items-center justify-center text-[#d97706]' }, [
    h('i', { class: 'pi pi-image', style: 'font-size:36px' }),
  ]),
  // 已使用標籤
  props.disabled
    ? h('span', {
        class: 'absolute top-2 left-2 bg-[var(--p-text-muted-color)] text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-none',
      }, props.usedLabel ?? '')
    : null,
  h('div', { class: 'relative w-full px-[6px] py-[8px] bg-[var(--p-content-background)]/70 flex flex-col gap-1' }, [
    h('p', { class: 'text-[var(--p-text-color)] text-[16px] leading-6 line-clamp-2 h-[49px] overflow-hidden' }, props.title),
    h('p', { class: 'text-[var(--p-text-muted-color)] text-[14px] leading-5' }, props.date),
  ]),
])
PostCard.props = ['title', 'date', 'selected', 'disabled', 'usedLabel']
PostCard.emits = ['click']

interface SourceOption {
  key: 'live' | 'post' | 'group'
  title: string
  desc: string
  topIcon: string
  centerIcon: string
}

interface ConfirmExtras {
  postId?: number | string | null
  groupId?: number | string | null
}

interface Props {
  visible?: boolean
  usedPostIds?: Array<number | string>
  usedGroupIds?: Array<number | string>
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  usedPostIds: () => [],
  usedGroupIds: () => [],
})
const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [type: string, extras?: ConfirmExtras]
  'live-pending': []
}>()

const { t } = useI18n()

const innerVisible = ref(props.visible)
const step = ref<'source' | 'post' | 'fb-post' | 'ig-post' | 'group'>('source')

// 重置 internal state when externally opened
watch(() => props.visible, v => {
  innerVisible.value = v
  if (v) {
    step.value = 'source'
    selectedPostId.value = null
    selectedGroupId.value = null
    pasteUrl.value = ''
  }
})

function onVisibleChange(v: boolean): void { emit('update:visible', v) }
/** Close the dialog and notify the parent. */
function close(): void {
  innerVisible.value = false
  emit('update:visible', false)
}

const dialogWidth = computed(() => {
  if (step.value === 'source') return '940px'
  if (step.value === 'post') return '720px'
  return '900px' // fb / ig / group
})

const headerTitle = computed(() => {
  if (step.value === 'source') return t('live_order.title.pick_source')
  if (step.value === 'group')  return t('live_order.title.group_source')
  return t('live_order.title.post_source')
})

const sourceOptions = computed<SourceOption[]>(() => [
  // 小 icon（左上 48px 紫底白圖示）+ 大 icon（中央 130px 淡紫色裝飾）
  { key: 'live',  title: t('live_order.source_option.live_title'),  desc: t('live_order.source_option.live_desc'),  topIcon: 'pi pi-video',          centerIcon: 'pi pi-video' },
  { key: 'post',  title: t('live_order.source_option.post_title'),  desc: t('live_order.source_option.post_desc'),  topIcon: 'pi pi-pen-to-square', centerIcon: 'pi pi-comments' },
  { key: 'group', title: t('live_order.source_option.group_title'), desc: t('live_order.source_option.group_desc'), topIcon: 'pi pi-users',          centerIcon: 'pi pi-users' },
])

/** Handle initial source pick: live confirms immediately, others move to the next step. */
function onSourcePick(key: SourceOption['key']): void {
  if (key === 'live') {
    emit('confirm', 'live')
    close()
  } else if (key === 'post') {
    step.value = 'post'
  } else if (key === 'group') {
    step.value = 'group'
  }
}

// 佔位資料：10 張貼文 / 社團卡
const placeholderPosts = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: '【限時優惠,要搶】超柔軟精緻冬衣冬季羊毛衫，多色可選！快來選購，現在下單享有 8 折優惠好康活動搶不完，快來留言！',
  date: '2024-03-12',
}))
const placeholderGroups = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `直播購物社團 #${i + 1}（佔位）`,
  date: '2024-03-12',
}))

const selectedPostId = ref<number | null>(null)
const selectedGroupId = ref<number | null>(null)
const pasteUrl = ref('')

function confirmPost(): void {
  emit('confirm', step.value === 'fb-post' ? 'fb' : 'ig', { postId: selectedPostId.value })
  close()
}
function confirmGroup(): void {
  emit('confirm', 'group', { groupId: selectedGroupId.value })
  close()
}
</script>
