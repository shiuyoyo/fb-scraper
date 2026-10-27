import type { Course, EducationSiteContent, Teacher } from "@evalycloud/content-schema";
import { mergeList } from "./merge.ts";
import type { MultiSheetConfig } from "./sources.ts";
import type { SheetResult } from "./sheet.ts";
import {
  bool,
  bySort,
  cell,
  compact,
  enabled,
  faqColumns,
  faqRows,
  galleryColumns,
  galleryRows,
  image,
  mapFaq,
  mapGallery,
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

export const courseColumns = [
  "id",
  "name",
  "audience",
  "description",
  "price_label",
  "schedule",
  "duration",
  "image_src",
  "image_alt",
  "tags",
  "featured",
  "enabled",
  "sort_order",
];

/** courses — rows without an id or a name are dropped; the rest stay. */
export function mapCourses(result: SheetResult | undefined): Course[] | undefined {
  const list: Course[] = [];
  for (const row of rows(result)) {
    const id = text(row.id);
    const name = text(row.name);
    if (!id || !name || !enabled(row)) continue;
    list.push(
      compact({
        id,
        name,
        audience: text(row.audience),
        description: text(row.description),
        priceLabel: text(row.price_label),
        schedule: text(row.schedule),
        duration: text(row.duration),
        image: image(row.image_src, row.image_alt),
        tags: pipe(row.tags),
        featured: bool(row.featured) || undefined,
        sort: num(row.sort_order),
      }),
    );
  }
  return orNone(list.sort(bySort));
}

function courseRows(list: Course[]): Row[] {
  return list.map((course) => ({
    id: course.id,
    name: course.name,
    audience: cell(course.audience),
    description: cell(course.description),
    price_label: cell(course.priceLabel),
    schedule: cell(course.schedule),
    duration: cell(course.duration),
    image_src: cell(course.image?.src),
    image_alt: cell(course.image?.alt),
    tags: cell(course.tags),
    featured: course.featured ? "true" : "false",
    enabled: "true",
    sort_order: cell(course.sort),
  }));
}

export const teacherColumns = ["name", "title", "bio", "photo_src", "photo_alt", "subjects", "enabled", "sort_order"];

export function mapTeachers(result: SheetResult | undefined): Teacher[] | undefined {
  const list = rows(result)
    .filter((row) => text(row.name) && enabled(row))
    .map((row) => ({
      value: compact({
        name: row.name.trim(),
        title: text(row.title),
        bio: text(row.bio),
        photo: image(row.photo_src, row.photo_alt),
        subjects: pipe(row.subjects),
      }),
      sort: num(row.sort_order),
    }));
  return orNone(ordered(list));
}

function teacherRows(list: Teacher[] | undefined): Row[] {
  return (list ?? []).map((teacher, index) => ({
    name: teacher.name,
    title: cell(teacher.title),
    bio: cell(teacher.bio),
    photo_src: cell(teacher.photo?.src),
    photo_alt: cell(teacher.photo?.alt),
    subjects: cell(teacher.subjects),
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}

export const educationSheetSpec: KitSheetSpec<EducationSiteContent> = {
  optional: [
    ...sharedOptional,
    { path: "hero", fields: ["subtitle", "tagline", "intro"] },
    { path: "hero.image", ...imageFields },
    { path: "hero.enrollCta", ...linkFields },
    { path: "hero.coursesCta", ...linkFields },
    { path: "about", fields: ["title", "description"], required: ["title"] },
    { path: "enrollment", fields: ["intro", "phone", "lineUrl", "formUrl"] },
    {
      path: "venue",
      fields: ["name", "address", "mapUrl", "transportNotes"],
      required: ["address"],
      arrays: ["transportNotes"],
    },
    { path: "labels", fields: ["about", "courses", "teachers", "features", "faq", "enroll", "gallery"] },
  ],
  tabs: [
    {
      source: "features",
      file: "2_features.csv",
      owns: "features",
      columns: titledColumns,
      toRows: (content) => titledRows(content.features),
      apply: (content, result) => ({ ...content, features: mergeList(content.features ?? [], mapTitled(result)) }),
    },
    {
      source: "courses",
      file: "3_courses.csv",
      owns: "courses",
      columns: courseColumns,
      toRows: (content) => courseRows(content.courses),
      apply: (content, result) => ({ ...content, courses: mergeList(content.courses, mapCourses(result)) }),
    },
    {
      source: "teachers",
      file: "4_teachers.csv",
      owns: "teachers",
      columns: teacherColumns,
      toRows: (content) => teacherRows(content.teachers),
      apply: (content, result) => ({ ...content, teachers: mergeList(content.teachers ?? [], mapTeachers(result)) }),
    },
    {
      source: "gallery",
      file: "5_gallery.csv",
      owns: "gallery",
      columns: galleryColumns,
      toRows: (content) => galleryRows(content.gallery),
      apply: (content, result) => ({ ...content, gallery: mergeList(content.gallery ?? [], mapGallery(result)) }),
    },
    {
      source: "faq",
      file: "6_faq.csv",
      owns: "faq",
      columns: faqColumns,
      toRows: (content) => faqRows(content.faq),
      apply: (content, result) => ({ ...content, faq: mergeList(content.faq ?? [], mapFaq(result)) }),
    },
  ],
};

export async function resolveEducationContent(fallback: EducationSiteContent, config?: MultiSheetConfig) {
  const { content, diagnostics } = await resolveKitSheets(fallback, config, educationSheetSpec);
  return { content, diagnostics };
}
