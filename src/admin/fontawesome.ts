import { library } from '@fortawesome/fontawesome-svg-core'

// live-order / live-records 等 live-commerce 原本就用 fas 的圖示維持 solid。
import {
  faArrowRightArrowLeft,
  faArrowUpRightFromSquare,
  faBullhorn as faBullhornSolid,
  faChevronLeft as faChevronLeftSolid,
  faCircleCheck,
  faCircleDollarToSlot,
  faCommentDots,
  faCommentMedical,
  faCube,
  faHashtag as faHashtagSolid,
  faInbox,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faPen,
  faPenToSquare,
  faPlus,
  faReply,
  faSearch,
  faShuffle,
  faSortDown,
  faTag,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import {
  faComment as faCommentRegular,
  faCommentDots as faCommentDotsRegular,
  faEdit as faEditRegular,
  faEye as faEyeRegular,
  faPenToSquare as faPenToSquareRegular,
  faUser as faUserRegular,
} from '@fortawesome/free-regular-svg-icons'

// 後台 header / sidebar 等 portal-vue 風格的 layout 走 Pro kit 的 regular（線框版）。
import {
  faBell,
  faBuildingUser,
  faBullhorn,
  faChevronDown,
  faChevronLeft,
  faClipboardList,
  faEnvelope,
  faEye,
  faFileCirclePlus,
  faGift,
  faGlobe,
  faHashtag,
  faMoon,
  faRightFromBracket,
  faShop,
  faSun,
  faTowerBroadcast,
  faUser,
} from '@awesome.me/kit-979923bcd0/icons/classic/regular'

/**
 * 集中註冊本專案會用到的 FontAwesome icon；新元件用新 icon 時請補進來。
 *
 * 同名同 prefix（如 solid faChevronLeft 與 regular faChevronLeft）會以**後加入者覆蓋**前者，
 * 而 layout 元件指定 `['far', 'X']`、live-order 多半 `['fas', 'X']`，因此實際靠 prefix 分流；
 * 重複註冊 solid/regular 同名 icon 是安全的——前提是 imports 用 alias 區分（faBullhornSolid vs faBullhorn）。
 */
library.add(
  // fas — live-commerce 原本就用的
  faArrowRightArrowLeft,
  faArrowUpRightFromSquare,
  faBullhornSolid,
  faChevronLeftSolid,
  faCircleCheck,
  faCircleDollarToSlot,
  faCommentDots,
  faCommentMedical,
  faCube,
  faHashtagSolid,
  faInbox,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faPen,
  faPenToSquare,
  faPlus,
  faReply,
  faSearch,
  faShuffle,
  faSortDown,
  faTag,
  faTrash,
  // far（free）— 少數 portal-vue 原本就用 regular 的
  faCommentRegular,
  faCommentDotsRegular,
  faEditRegular,
  faEyeRegular,
  faPenToSquareRegular,
  faUserRegular,
  // far（Pro kit）— layout 用的線框版
  faBell,
  faBuildingUser,
  faBullhorn,
  faChevronDown,
  faChevronLeft,
  faClipboardList,
  faEnvelope,
  faEye,
  faFileCirclePlus,
  faGift,
  faGlobe,
  faHashtag,
  faMoon,
  faRightFromBracket,
  faShop,
  faSun,
  faTowerBroadcast,
  faUser,
)
