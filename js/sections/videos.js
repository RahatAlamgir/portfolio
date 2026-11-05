/* Videos: every project with a `youtube` link, plus the channel button. */

import { el, icon, externalLink, fmt, sectionHeading } from "../core/dom.js";
import { projectMedia } from "../components/media.js";

export function renderVideos(mount, { site, profile, projects }) {
  const { ui } = site;
  const copy = site.sections.videos;
  const videos = projects.items.filter((p) => p.youtube);
  const channel = profile.social.find((s) => s.id === "youtube");

  // Nothing to show yet: hide the section and its nav link
  if (!videos.length) {
    mount.hidden = true;
    document.querySelectorAll('a[href="#videos"]').forEach((a) => (a.hidden = true));
    return;
  }

  const head = el("div", { className: "section-head" }, [
    el("div", {}, sectionHeading(copy)),
    channel && channel.url
      ? externalLink(channel.url, "btn btn-outline", [icon("youtube", "icon-lg"), copy.channelButton])
      : null
  ]);

  const grid = el("div", { className: "video-grid" }, videos.map((p) =>
    externalLink(p.youtube, "video", [
      el("div", { className: "video-thumb" }, [
        projectMedia(p, ui, { decorative: true }),
        el("span", { className: "play-btn", "aria-hidden": "true" }, [icon("play")]),
        el("span", { className: "video-format", text: p.youtube.includes("/shorts/") ? ui.videoShort : ui.videoLong })
      ]),
      el("div", {}, [
        el("p", { className: "video-title", text: fmt(copy.videoTitle, { title: p.title }) }),
        el("p", { className: "video-meta", text: p.kind })
      ])
    ])
  ));

  mount.replaceChildren(head, grid);
}
