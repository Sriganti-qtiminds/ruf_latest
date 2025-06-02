
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TabNavigation = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const navigate = useNavigate();

  const tabs = [
    {
      id: "/",
      label: "Rentals",
      title: "Rufrent - Best Property Rental Platform in Hyderabad",
      metaDescription:
        "Explore our rental properties and find your perfect home.",
      ogDescription:
        "Find & list apartments, houses, villas for rent in Hyderabad. 1000+ verified properties with photos, videos & virtual tours.",
      link: "https://www.Rufrent.com/",
    },
    {
      id: "/studio",
      label: "Studio",
      title: "Rufrent - Best studio spaces for your creative needs",
      metaDescription: "Discover our studio spaces for your creative needs.",
      ogDescription: "Explore creative studio spaces tailored for you.",
      link: "https://www.Rufrent.com/studio",
    },
  ];

  // Update document title and meta tags based on active tab
  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activePath) || tabs[0];

    // Update document title
    document.title = activeTab.title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = activeTab.metaDescription;

    // Update or create Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = activeTab.title;

    // Update or create Open Graph URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.content = activeTab.link;

    // Update or create Open Graph description
    let ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = activeTab.ogDescription;
  }, [activePath, tabs]);

  return (
    <div className="inline-flex flex-wrap bg-white/10 backdrop-blur-md p-1 gap-2 rounded-full mt-4 max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button px-6 py-2 font-medium text-sm rounded-full whitespace-nowrap transition-all duration-300
                        ${
                          activePath === tab.id
                            ? " text-amber-400 bg-white/15 shadow-md hover:bg-white/30 active:bg-white/30"
                            : " text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20"
                        }`}
          onClick={() => navigate(tab.id)}
          data-tab={tab.id}
          aria-selected={activePath === tab.id}
          role="tab"
        >
          <span
            className={activePath === tab.id ? "text-shadow-sm font-bold" : ""}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
