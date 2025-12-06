"use server"

import { createReel, type CreateReelInput } from "./reels"

// ============ Types ============

export type Platform = "TIKTOK" | "INSTAGRAM" | "YOUTUBE"

export type ResolvedEmbed = {
    embedUrl: string
    originalUrl: string
    platform: Platform
    thumbnailUrl?: string
    tiktokEmbedHtml?: string
    caption?: string
    hashtags: string[]
    rawOEmbed?: OEmbedResponse
}

export type OEmbedResponse = {
    type?: string
    version?: string
    title?: string
    author_name?: string
    author_url?: string
    provider_name?: string
    provider_url?: string
    thumbnail_url?: string
    thumbnail_width?: number
    thumbnail_height?: number
    html?: string
    width?: number
    height?: number
}

// ============ Shared Utilities ============

export async function detectPlatform(url: string): Promise<Platform | null> {
    const normalized = url.toLowerCase()
    if (normalized.includes("tiktok.com") || normalized.includes("vm.tiktok.com")) return "TIKTOK"
    if (normalized.includes("instagram.com") || normalized.includes("instagr.am")) return "INSTAGRAM"
    if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "YOUTUBE"
    return null
}

function extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w\u0080-\uFFFF]+/g)
    return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : []
}

// ============ TIKTOK LOGIC ============

async function resolveTikTok(url: string): Promise<ResolvedEmbed | null> {
    try {
        // 1. Resolve short URLs (vm.tiktok.com)
        const resolved = await fetch(url, { redirect: "follow" })
        const finalUrl = resolved.url
        const html = await resolved.text()
        // console.log('html', html)



        // 2. Fetch TikTok oEmbed
        const oembedEndpoint = "https://www.tiktok.com/oembed?url=" + encodeURIComponent(finalUrl)
        const oembedRes = await fetch(oembedEndpoint, { method: "GET", redirect: "follow" })

        if (!oembedRes.ok) return null

        const oembedJson: OEmbedResponse = await oembedRes.json()

        console.log('Tik tok Json', oembedJson);

        // 3. Build normalized embed data
        const caption = oembedJson.title || ""
        const hashtags = extractHashtags(caption)
        console.log('Final TikTok URL:', oembedJson);


        return {
            embedUrl: finalUrl,
            originalUrl: finalUrl,
            platform: "TIKTOK",
            thumbnailUrl: oembedJson.thumbnail_url,
            tiktokEmbedHtml: oembedJson.html,
            caption,
            hashtags,
            rawOEmbed: oembedJson,
        }
    } catch (error) {
        console.error("TikTok resolve error:", error)
        return null
    }
}

// ============ INSTAGRAM LOGIC ============

async function resolveInstagram(url: string): Promise<ResolvedEmbed | null> {
    try {
        // Extract shortcode from URL
        const reelMatch = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/)
        if (!reelMatch) return null

        const shortcode = reelMatch[1]

        // Instagram oEmbed requires Facebook access token for full data
        // Using public embed iframe as fallback
        const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed`

        // Try to fetch oEmbed (may fail without access token)
        let oembedJson: OEmbedResponse | null = null
        try {
            const oembedEndpoint = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&format=json`
            const oembedRes = await fetch(oembedEndpoint)
            if (oembedRes.ok) {
                oembedJson = await oembedRes.json()
            }
        } catch {
            // oEmbed failed, continue with basic data
        }

        const caption = oembedJson?.title || ""
        const hashtags = extractHashtags(caption)

        return {
            embedUrl,
            originalUrl: url,
            platform: "INSTAGRAM",
            thumbnailUrl: oembedJson?.thumbnail_url,
            caption,
            hashtags,
            rawOEmbed: oembedJson || {
                type: "video",
                provider_name: "Instagram",
                html: `<iframe src="${embedUrl}" width="400" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`,
            },
        }
    } catch (error) {
        console.error("Instagram resolve error:", error)
        return null
    }
}

// ============ YOUTUBE LOGIC ============

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/,
        /youtube\.com\/embed\/([A-Za-z0-9_-]+)/,
        /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/,
        /youtu\.be\/([A-Za-z0-9_-]+)/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

async function resolveYouTube(url: string): Promise<ResolvedEmbed | null> {
    try {
        const videoId = extractYouTubeId(url)
        if (!videoId) return null

        // Fetch YouTube oEmbed
        const oembedEndpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        const oembedRes = await fetch(oembedEndpoint, {
            headers: { Accept: "application/json" },
        })

        let oembedJson: OEmbedResponse | null = null
        if (oembedRes.ok) {
            oembedJson = await oembedRes.json()
        }

        const embedUrl = `https://www.youtube.com/embed/${videoId}`
        const thumbnailUrl = oembedJson?.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        const caption = oembedJson?.title || ""
        const hashtags = extractHashtags(caption)

        return {
            embedUrl,
            originalUrl: url,
            platform: "YOUTUBE",
            thumbnailUrl,
            caption,
            hashtags,
            rawOEmbed: oembedJson || {
                type: "video",
                provider_name: "YouTube",
                thumbnail_url: thumbnailUrl,
                html: `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`,
            },
        }
    } catch (error) {
        console.error("YouTube resolve error:", error)
        return null
    }
}

// ============ Main Server Functions ============

export async function resolveEmbed(
    url: string,
): Promise<{ success: true; data: ResolvedEmbed } | { success: false; error: string }> {
    try {
        // Normalize URL
        let normalizedUrl = url.trim()
        if (!normalizedUrl.startsWith("http")) {
            normalizedUrl = `https://${normalizedUrl}`
        }

        // Detect platform
        const platform = await detectPlatform(normalizedUrl)
        if (!platform) {
            return { success: false, error: "Unsupported platform. Use TikTok, Instagram, or YouTube." }
        }

        let resolvedEmbed: ResolvedEmbed | null = null

        switch (platform) {
            case "TIKTOK":
                resolvedEmbed = await resolveTikTok(normalizedUrl)
                break
            case "INSTAGRAM":
                resolvedEmbed = await resolveInstagram(normalizedUrl)
                break
            case "YOUTUBE":
                resolvedEmbed = await resolveYouTube(normalizedUrl)
                break
        }

        if (!resolvedEmbed) {
            return { success: false, error: `Failed to resolve ${platform} embed. Please check the URL.` }
        }

        return { success: true, data: resolvedEmbed }
    } catch (error) {
        console.error("Failed to resolve embed:", error)
        return { success: false, error: "Failed to resolve embed. Please check the URL." }
    }
}

export async function submitEmbed(data: {
    embedUrl: string
    originalUrl: string
    platform: Platform
    thumbnailUrl?: string
    tiktokEmbedHtml?: string
    caption?: string
    hashtags?: string[]
    postedById: number
}): Promise<{ success: true; data: unknown } | { success: false; error: string }> {
    try {
        const input: CreateReelInput = {
            embedUrl: data.embedUrl,
            originalUrl: data.originalUrl,
            platform: data.platform,
            thumbnailUrl: data.thumbnailUrl,
            tiktokEmbedHtml: data.tiktokEmbedHtml,
            caption: data.caption,
            hashtags: data.hashtags || [],
            postedById: data.postedById,
        }

        const result = await createReel(input)

        if (!result.success) {
            return { success: false, error: result.error || "Failed to save reel" }
        }

        return { success: true, data: result.data }
    } catch (error) {
        console.error("Failed to submit embed:", error)
        return { success: false, error: "Failed to save reel. Please try again." }
    }
}
