import type { ImageRef, PortfolioProject, PortfolioSiteContent } from "@evalycloud/content-schema";
import { mergeList } from "./merge.ts";
import type { MultiSheetConfig } from "./sources.ts";
import type { SheetResult } from "./sheet.ts";
import {
  bool,
  bySort,
  cell,
  compact,
  enabled,
  image,
  link,
  mapTitled,
  num,
  orNone,
  ordered,
  pipe,
  rows,
  text,
  titledColumns,
  titledRows,
  type Row,
} from "./common.ts";
import { imageFields, linkFields, resolveKitSheets, sharedOptional, type KitSheetSpec } from "./kit-sheets.ts";

export const projectColumns = [
  "id",
  "title",
  "meta",
  "description",
  "cover_src",
  "cover_alt",
  "image_srcs",
  "image_alts",
  "tags",
  "url_label",
  "url_href",
  "featured",
  "enabled",
  "sort_order",
];

/**
 * projects — extra images are two parallel `|` lists (image_srcs, image_alts)
 * so one row stays one project. A missing alt becomes "" rather than dropping
 * the picture.
 */
export function mapProjects(result: SheetResult | undefined): PortfolioProject[] | undefined {
  const list: PortfolioProject[] = [];
  for (const row of rows(result)) {
    const id = text(row.id);
    const title = text(row.title);
    if (!id || !title || !enabled(row)) continue;

    const alts = (row.image_alts ?? "").split("|").map((alt) => alt.trim());
    const images: ImageRef[] = (pipe(row.image_srcs) ?? []).map((src, index) => ({ src, alt: alts[index] ?? "" }));

    list.push(
      compact({
        id,
        title,
        meta: text(row.meta),
        description: text(row.description),
        cover: image(row.cover_src, row.cover_alt),
        images: orNone(images),
        tags: pipe(row.tags),
        url: link(row.url_label, row.url_href),
        featured: bool(row.featured) || undefined,
        sort: num(row.sort_order),
      }),
    );
  }
  return orNone(list.sort(bySort));
}

function projectRows(list: PortfolioProject[]): Row[] {
  return list.map((project) => ({
    id: project.id,
    title: project.title,
    meta: cell(project.meta),
    description: cell(project.description),
    cover_src: cell(project.cover?.src),
    cover_alt: cell(project.cover?.alt),
    image_srcs: cell(project.images?.map((img) => img.src)),
    image_alts: cell(project.images?.map((img) => img.alt)),
    tags: cell(project.tags),
    url_label: cell(project.url?.label),
    url_href: cell(project.url?.href),
    featured: project.featured ? "true" : "false",
    enabled: "true",
    sort_order: cell(project.sort),
  }));
}

export const clientColumns = ["name", "logo_src", "logo_alt", "enabled", "sort_order"];

export function mapClients(result: SheetResult | undefined): PortfolioSiteContent["clients"] {
  const list = rows(result)
    .filter((row) => text(row.name) && enabled(row))
    .map((row) => ({
      value: compact({ name: row.name.trim(), logo: image(row.logo_src, row.logo_alt) }),
      sort: num(row.sort_order),
    }));
  return orNone(ordered(list));
}

function clientRows(list: PortfolioSiteContent["clients"]): Row[] {
  return (list ?? []).map((client, index) => ({
    name: client.name,
    logo_src: cell(client.logo?.src),
    logo_alt: cell(client.logo?.alt),
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}

export const portfolioSheetSpec: KitSheetSpec<PortfolioSiteContent> = {
  optional: [
    ...sharedOptional,
    { path: "hero", fields: ["role", "tagline", "intro"] },
    { path: "hero.image", ...imageFields },
    { path: "hero.workCta", ...linkFields },
    { path: "hero.contactCta", ...linkFields },
    { path: "about", fields: ["title", "description"], required: ["title"] },
    { path: "about.image", ...imageFields },
    { path: "labels", fields: ["about", "work", "services", "clients", "contact"] },
  ],
  tabs: [
    {
      source: "projects",
      file: "2_projects.csv",
      owns: "projects",
      columns: projectColumns,
      toRows: (content) => projectRows(content.projects),
      apply: (content, result) => ({ ...content, projects: mergeList(content.projects, mapProjects(result)) }),
    },
    {
      source: "services",
      file: "3_services.csv",
      owns: "services",
      columns: titledColumns,
      toRows: (content) => titledRows(content.services),
      apply: (content, result) => ({ ...content, services: mergeList(content.services ?? [], mapTitled(result)) }),
    },
    {
      source: "clients",
      file: "4_clients.csv",
      owns: "clients",
      columns: clientColumns,
      toRows: (content) => clientRows(content.clients),
      apply: (content, result) => ({ ...content, clients: mergeList(content.clients ?? [], mapClients(result)) }),
    },
  ],
};

export async function resolvePortfolioContent(fallback: PortfolioSiteContent, config?: MultiSheetConfig) {
  const { content, diagnostics } = await resolveKitSheets(fallback, config, portfolioSheetSpec);
  return { content, diagnostics };
}
