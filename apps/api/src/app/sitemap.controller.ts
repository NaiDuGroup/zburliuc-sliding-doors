import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const SITE_URL = process.env['SITE_URL'] ?? 'https://zburliuc.com';
const LANGS = ['ru', 'en', 'de'];

@Controller()
export class SitemapController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getSitemap(@Res() res: Response): Promise<void> {
    const portfolioItems = await this.prisma.portfolioItem.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const staticRoutes = ['', '/catalog', '/configurator', '/faq', '/contact'];

    const staticUrls = staticRoutes.flatMap((route) =>
      LANGS.map(
        (lang) => `
  <url>
    <loc>${SITE_URL}/${lang}${route}</loc>
    <changefreq>${route === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '' ? '1.0' : route === '/configurator' ? '0.9' : '0.7'}</priority>
    ${LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${route}"/>`).join('\n    ')}
  </url>`,
      ),
    );

    const portfolioUrls = portfolioItems.flatMap((item) =>
      LANGS.map(
        (lang) => `
  <url>
    <loc>${SITE_URL}/${lang}/catalog/${item.slug}</loc>
    <lastmod>${item.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
      ),
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls.join('')}
${portfolioUrls.join('')}
</urlset>`;

    res.send(xml);
  }
}
