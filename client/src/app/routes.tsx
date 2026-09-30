import type { ReactNode } from "react";
import { useContext } from "react";
import type { DefaultParams, PathPattern } from "wouter";
import { Route, Switch, useLocation } from "wouter";
import { AdminLayout } from "../components/admin-layout";
import Footer from "../components/footer";
import { Header } from "../components/header";
import { Padding } from "../components/padding";
import { getHeaderLayoutDefinition } from "../components/site-header/layout-registry";
import { Tips, TipsPage } from "../components/tips";
import useTableOfContents from "../hooks/useTableOfContents";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { CallbackPage } from "../page/callback";
import { CompatTasksPage } from "../page/compat-tasks";
import { ErrorPage } from "../page/error";
import { FeedPage, TOCHeader } from "../page/feed";
import { FeedsPage } from "../page/feeds";
import { FriendsPage } from "../page/friends";
import { HealthPage } from "../page/health";
import { HashtagPage } from "../page/hashtag";
import { HashtagsPage } from "../page/hashtags";
import { LoginPage } from "../page/login";
import { MomentsPage } from "../page/moments";
import { ProfilePage } from "../page/profile";
import { QueueStatusPage } from "../page/queue-status";
import { SearchPage } from "../page/search";
import { Settings } from "../page/settings";
import { TimelinePage } from "../page/timeline";
import { WritingPage } from "../page/writing";
import { ProfileContext } from "../state/profile";
import { tryInt } from "../utils/int";
import { useTranslation } from "react-i18next";

const GeminiLayout = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useLocation();
  const profile = useContext(ProfileContext);
  const { t } = useTranslation();

  return (
    <div className="flex h-[100dvh] w-full bg-[#F0F4F9] dark:bg-[#131314] overflow-hidden font-sans text-gray-800 dark:text-gray-200">
      <aside className="w-[280px] hidden md:flex flex-col py-6 px-4 bg-transparent select-none">
        <div className="mb-6 pl-2 pr-4">
          <button 
            onClick={() => setLocation(profile?.permission ? '/admin/writing' : '/login')}
            className="flex items-center gap-3 px-5 py-3.5 bg-[#e8eaf1] dark:bg-[#282a2c] hover:bg-[#dfe1e8] dark:hover:bg-[#333538] rounded-[24px] text-[15px] font-medium transition-colors w-max shadow-sm"
          >
            <i className="ri-quill-pen-line text-lg text-gray-600 dark:text-gray-300"></i>
            {t("writing")}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1">
          <NavItem href="/" icon="ri-home-5-line" label={t("nav.home") || "首页"} current={location} setLocation={setLocation} />
          <NavItem href="/timeline" icon="ri-time-line" label={t("nav.timeline") || "时间轴"} current={location} setLocation={setLocation} />
          <NavItem href="/moments" icon="ri-chat-smile-3-line" label={t("nav.moments") || "动态"} current={location} setLocation={setLocation} />
          <NavItem href="/hashtags" icon="ri-hashtag" label={t("nav.hashtags") || "标签"} current={location} setLocation={setLocation} />
          <NavItem href="/friends" icon="ri-team-line" label={t("nav.friends") || "友链"} current={location} setLocation={setLocation} />
        </nav>
        <div className="pt-2 mt-2">
          {profile?.permission ? (
            <NavItem href="/admin/settings" icon="ri-settings-3-line" label={t("settings.title")} current={location} setLocation={setLocation} />
          ) : (
            <NavItem href="/login" icon="ri-login-circle-line" label="登录" current={location} setLocation={setLocation} />
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full py-4 pr-4 pl-4 md:pl-0">
        <div className="flex-1 bg-white dark:bg-[#1e1f20] rounded-[32px] md:rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col relative w-full h-full">
          <header className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-[#1e1f20]/80 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800">
             <span className="font-medium text-lg">My Site</span>
             {profile?.permission && (
               <button onClick={() => setLocation('/admin/writing')} className="text-gray-600 dark:text-gray-300">
                 <i className="ri-quill-pen-line text-xl"></i>
               </button>
             )}
          </header>
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ href, icon, label, current, setLocation }: { href: string; icon: string; label: string; current: string; setLocation: (url: string) => void }) => {
  const isActive = current === href || (href !== '/' && current.startsWith(href));
  
  const baseClasses = "flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer text-[14px] font-medium transition-colors ";
  const activeClasses = "bg-[#d3e3fd] text-[#041e49] dark:bg-[#4a5568] dark:text-blue-200";
  const inactiveClasses = "hover:bg-[#e8eaf1] text-gray-700 dark:text-gray-300 dark:hover:bg-[#282a2c]";
  
  const iconBaseClasses = icon + " text-lg ";
  const iconActiveClasses = "text-[#041e49] dark:text-blue-200";
  const iconInactiveClasses = "opacity-70";

  return (
    <div 
      onClick={() => setLocation(href)}
      className={baseClasses + (isActive ? activeClasses : inactiveClasses)}
    >
      <i className={iconBaseClasses + (isActive ? iconActiveClasses : iconInactiveClasses)}></i>
      {label}
    </div>
  );
};

export function AppRoutes() {
  const { t } = useTranslation();

  return (
    <GeminiLayout>
      <Switch>
        <AppRoute path="/">
          <FeedsPage />
        </AppRoute>
        <AppRoute path="/timeline">
          <TimelinePage />
        </AppRoute>
        <AppRoute path="/moments">
          <MomentsPage />
        </AppRoute>
        <AppRoute path="/friends">
          <FriendsPage />
        </AppRoute>
        <AppRoute path="/hashtags">
          <HashtagsPage />
        </AppRoute>
        <AppRoute path="/hashtag/:name">
          {(params) => <HashtagPage name={params.name || ""} />}
        </AppRoute>
        <AppRoute path="/search/:keyword">
          {(params) => <SearchPage keyword={params.keyword || ""} />}
        </AppRoute>
        <AdminRoute path="/admin/settings" requirePermission title={t("settings.title")} description={t("admin.settings_description")}>
          <Settings />
        </AdminRoute>
        <AdminRoute path="/admin/health" requirePermission title={t("health.title")} description={t("admin.health_description")}>
          <HealthPage />
        </AdminRoute>
        <AdminRoute path="/admin/queue-status" requirePermission title={t("queue_status.title")} description={t("admin.queue_status_description")}>
          <QueueStatusPage />
        </AdminRoute>
        <AdminRoute path="/admin/compat-tasks" requirePermission title={t("compat_tasks.title")} description={t("admin.compat_tasks_description")}>
          <CompatTasksPage />
        </AdminRoute>
        <AdminRoute path="/admin/writing" requirePermission title={t("writing")} description={t("admin.writing_description")}>
          <WritingPage />
        </AdminRoute>
        <AdminRoute path="/admin/writing/:id" requirePermission title={t("writing")} description={t("admin.writing_description")}>
          {({ id }) => <WritingPage id={tryInt(0, id)} />}
        </AdminRoute>
        <AppRoute path="/callback">
          <CallbackPage />
        </AppRoute>
        <AppRoute path="/login">
          <LoginPage />
        </AppRoute>
        <AppRoute path="/profile">
          <ProfilePage />
        </AppRoute>
        <TocRoute path="/feed/:id">
          {(params, toc, cleanup) => <FeedPage id={params.id || ""} TOC={toc} clean={cleanup} />}
        </TocRoute>
        <TocRoute path="/:alias">
          {(params, toc, cleanup) => <FeedPage id={params.alias || ""} TOC={toc} clean={cleanup} />}
        </TocRoute>
        <AppRoute path="/user/github">
          <TipsPage>
            <Tips value={t("error.api_url")} type="error" />
          </TipsPage>
        </AppRoute>
        <AppRoute path="/*/user/github">
          <TipsPage>
            <Tips value={t("error.api_url_slash")} type="error" />
          </TipsPage>
        </AppRoute>
        <AppRoute path="/user/github/callback">
          <TipsPage>
            <Tips value={t("error.github_callback")} type="error" />
          </TipsPage>
        </AppRoute>
        <AppRoute>
          <ErrorPage error={t("error.not_found")} />
        </AppRoute>
      </Switch>
    </GeminiLayout>
  );
}

function AppRoute({
  path,
  children,
  headerComponent,
  paddingClassName,
  requirePermission,
}: {
  path?: PathPattern;
  children: ReactNode | ((params: DefaultParams) => ReactNode);
  headerComponent?: ReactNode;
  paddingClassName?: string;
  requirePermission?: boolean;
}) {
  const profile = useContext(ProfileContext);
  const siteConfig = useSiteConfig();
  const { t } = useTranslation();

  const content =
    requirePermission && !profile?.permission ? <ErrorPage error={t("error.permission_denied")} /> : children;

  return (
    <Route path={path}>
      {(params) => {
        const resolvedContent = typeof content === "function" ? content(params) : content;
        const layoutDefinition = getHeaderLayoutDefinition(siteConfig.headerLayout);

        return layoutDefinition.renderRouteShell({
          header: <Header>{headerComponent}</Header>,
          content: <Padding className={"px-4 sm:px-6 md:px-8 py-6 max-w-4xl mx-auto " + (paddingClassName || "")}>{resolvedContent}</Padding>,
          footer: <Footer />,
          paddingClassName,
        });
      }}
    </Route>
  );
}

function AdminRoute({
  path,
  children,
  requirePermission,
  title,
  description,
}: {
  path: PathPattern;
  children: ReactNode | ((params: DefaultParams) => ReactNode);
  requirePermission?: boolean;
  title: string;
  description: string;
}) {
  const profile = useContext(ProfileContext);
  const { t } = useTranslation();
  const content =
    requirePermission && !profile?.permission ? <ErrorPage error={t("error.permission_denied")} /> : children;

  return (
    <Route path={path}>
      {(params) => (
        <AdminLayout title={title} description={description}>
          {typeof content === "function" ? content(params) : content}
        </AdminLayout>
      )}
    </Route>
  );
}

function TocRoute({
  path,
  children,
}: {
  path: PathPattern;
  children: (params: DefaultParams, toc: () => JSX.Element, cleanup: (id: string) => void) => ReactNode;
}) {
  const { TOC, cleanup } = useTableOfContents(".toc-content");

  return (
    <AppRoute path={path} headerComponent={TOCHeader({ TOC })} paddingClassName="mx-4 md:mx-auto">
      {(params) => children(params, TOC, cleanup)}
    </AppRoute>
  );
}
