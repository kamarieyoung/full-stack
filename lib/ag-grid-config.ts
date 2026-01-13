"use client"

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"
import { AllEnterpriseModule, LicenseManager } from "ag-grid-enterprise"

// AG Grid Enterprise 许可证密钥
const AG_GRID_LICENSE_KEY =
  "[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-117602}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{12 February 2026}____[v3]_[0102]_MTc3MDg1NDQwMDAwMA==134c7b3943d88492470bef53e3e0565c"

// 标记是否已初始化，避免重复初始化
let isInitialized = false

/**
 * 初始化 AG Grid Enterprise 配置
 * 此函数应在应用启动时调用一次
 * 多次调用是安全的，但只会初始化一次
 * 只在客户端执行，避免 SSR hydration 错误
 */
export function initAgGrid() {
  // 只在客户端执行
  if (globalThis.window === undefined) {
    return
  }

  // 如果已经初始化，直接返回
  if (isInitialized) {
    return
  }

  // 配置许可证密钥
  LicenseManager.setLicenseKey(AG_GRID_LICENSE_KEY)

  // 注册 AG Grid 模块（包括 Community 和 Enterprise）
  ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])

  // 标记为已初始化
  isInitialized = true
}
