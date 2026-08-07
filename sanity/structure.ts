import type { StructureResolver } from 'sanity/structure'
import { HomeIcon, BookIcon, StarIcon, CogIcon } from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home')
        .icon(HomeIcon)
        .child(S.document().schemaType('home').documentId('home')),

      S.listItem()
        .title('Studio')
        .icon(BookIcon)
        .child(S.document().schemaType('about').documentId('about')),

      S.listItem()
        .title('Projects')
        .icon(StarIcon)
        .child(S.documentTypeList('project').title('Projects')),

      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('settings').documentId('settings')),
    ])