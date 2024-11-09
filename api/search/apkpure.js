import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import fetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import * as cheerio from 'cheerio';

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

const axiosInstance = axios.create({
    adapter: async (config) => {
        const response = await fetchWithCookies(config.url, {
            method: config.method,
            headers: config.headers,
            body: config.data,
        });
        return {
            data: await response.json(),
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            config: config,
            request: response,
        };
    }
});

const APKPure = {
    search: async (query) => {
        try {
            const url = `https://apkpure.com/api/v1/search_suggestion_new?key=${encodeURIComponent(query)}&limit=20`;
            const response = await axiosInstance.get(url);
            if (response.data.length === 0) {
                return `Pencarian ${query} tidak ditemukan!`;
            }
            const suggestions = response.data
                .map(({ title, key, packageName, icon, installTotal, score, fullUrl }) => ({
                    name: title || key,
                    packageName,
                    iconUrl: icon,
                    installTotal,
                    score,
                    fullUrl,
                }))
                .filter(({ name, packageName, iconUrl, installTotal, score, fullUrl }) => 
                    name && packageName && iconUrl && installTotal && score && fullUrl
                );
            return suggestions.length ? suggestions : `Responde data tidak dapat ditampilkan..`;
        } catch (error) {
            return `${error.message}`;
        }
    },
    
    detail: async (link) => {
        try {
            const url = link
            const response = await fetchWithCookies(url);
            const hs = await response.text();
            const $ = cheerio.load(hs);
            const data = {
                apkId: $('.aegon-down-item').attr('data-dt-apkid') || '',
                version: $('.aegon-down-item').attr('data-dt-version') || '',
                fileSize: $('.aegon-down-item').attr('data-dt-file_size') || '',
                versionCode: $('.aegon-down-item').attr('data-dt-version_code') || '',
                descriptionShort: $('.description-short').text().trim() || '',
                fullDescription: $('.content .translate-content div').html().trim() || '',
                latestVersion: $('.additional-item').eq(0).find('p.additional-info').text().trim() || '',
                uploadedBy: $('.additional-item').eq(1).find('p.additional-info').text().trim() || '',
                requiresAndroid: $('.additional-item').eq(2).find('p.additional-info').text().trim() || '',
                availableOn: $('.additional-item').eq(3).find('p.additional-info a').attr('href') || '',
                category: $('.additional-item').eq(4).find('p.additional-info').text().trim().replace(/\s+/g, ' ') || '',
                downloadLink: '',
                variants: [],
                screenshots: [],
                olderVersions: []
            };
            const dlink = $('.download_apk_news');
            data.downloadLink = dlink.attr('href') || '';
            $('.screen-pswp img').each((_, el) => {
                const imgSrc = $(el).attr('src');
                if (imgSrc && !imgSrc.includes("data:image/gif;base64")) {
                    data.screenshots.push(imgSrc);
                }
            });
            $('.old-versions .version-item').each((_, el) => {
                const versionText = $(el).find('.apk-name').text().trim();
                const sizeText = $(el).find('.size').text().trim();
                const updateText = $(el).find('.update').text().trim();
                const versionLink = $(el).attr('href');
                if (versionText && versionLink) {
                    data.olderVersions.push({ version: versionText, size: sizeText, updateDate: updateText, link: versionLink });
                }
            });
            if (data.downloadLink) {
                const vr = await fetchWithCookies(data.downloadLink);
                const vhs = await vr.text();
                const $variants = cheerio.load(vhs);
                $variants('#version-list .apk').each((_, el) => {
                    const vd = {
                        name: $variants(el).find('.name').text().trim(),
                        code: $variants(el).find('.code').text().trim(),
                        tag: $variants(el).find('.tag').text().trim(),
                        date: $variants(el).find('.time').text().trim(),
                        size: $variants(el).find('.size').text().trim(),
                        sdk: $variants(el).find('.sdk').text().trim(),
                        downloadLink: $variants(el).find('.download-btn').attr('href')
                    };
                    if (vd.name && vd.downloadLink) {
                        data.variants.push(vd);
                    }
                });
            }
            const fullDesc = data.fullDescription
                .replace(/<div.*?>|<\/div>|<br\s*\/?>|<p.*?>|<\/p>/g, '\n\n')
                .replace(/\s+/g, ' ').trim();
            return {
                apkId: data.apkId,
                version: data.version,
                fileSize: data.fileSize,
                versionCode: data.versionCode,
                description: {
                    short: data.descriptionShort,
                    full: fullDesc,
                },
                latestVersion: data.latestVersion,
                uploadedBy: data.uploadedBy,
                requiresAndroid: data.requiresAndroid,
                availableOn: data.availableOn,
                category: data.category,
                downloadLink: data.downloadLink,
                screenshots: data.screenshots,
                olderVersions: data.olderVersions,
                variants: data.variants
            };
        } catch (error) {
            return `${error.message}`;
        }
    }
};

export const search = APKPure.search;
export const detail = APKPure.detail;