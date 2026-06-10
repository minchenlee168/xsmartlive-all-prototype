import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRightArrowLeft,
  faBullhorn,
  faCircleCheck,
  faCircleDollarToSlot,
  faCommentDots,
  faCommentMedical,
  faCube,
  faHashtag,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faPen,
  faPenToSquare,
  faPlus,
  faReply,
  faSearch,
  faSortDown,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import {
  faComment as faCommentRegular,
  faCommentDots as faCommentDotsRegular,
  faEdit as faEditRegular,
  faEye as faEyeRegular,
  faPenToSquare as faPenToSquareRegular,
  faUser as faUserRegular,
} from '@fortawesome/free-regular-svg-icons'

/**
 * 集中註冊本專案會用到的 FontAwesome icon；新元件用新 icon 時請補進來。
 */
library.add(
  faArrowRightArrowLeft,
  faBullhorn,
  faCircleCheck,
  faCircleDollarToSlot,
  faCommentDots,
  faCommentMedical,
  faCube,
  faHashtag,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faPen,
  faPenToSquare,
  faPlus,
  faReply,
  faSearch,
  faSortDown,
  faTag,
  faCommentRegular,
  faCommentDotsRegular,
  faEditRegular,
  faEyeRegular,
  faPenToSquareRegular,
  faUserRegular,
)
