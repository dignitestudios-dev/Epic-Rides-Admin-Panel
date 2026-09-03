import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * App shell. The sidebar is a sticky column and the main region owns the
 * scroll, so the header stays pinned while a long table scrolls under it.
 */
const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-canvas text-ink">
    <Sidebar />

    <div className="flex-1 flex flex-col min-w-0">
      <Header />

      <main className="flex-1 min-w-0">
        <div className="px-4 lg:px-6 py-5">{children}</div>
      </main>
    </div>
  </div>
);

export default Layout;
