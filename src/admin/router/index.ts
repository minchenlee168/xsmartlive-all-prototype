import type { RouteRecordRaw } from 'vue-router'
import { liveOrderRoutes, RouteName } from './routes/liveOrderRoutes'

export { RouteName }
export { registerTitleGuard } from './guards/titleGuard'

/**
 * 後台子路由：掛在父路由 `/admin` 下。
 *
 * 路徑採相對形式（不以 `/` 開頭），實際 URL 會是 `/admin/live-order`、`/admin/live-records`。
 * RouteName 維持 `live.order` / `live.records`，不變動以避免改動所有引用。
 */
export const adminChildRoutes: RouteRecordRaw[] = liveOrderRoutes
