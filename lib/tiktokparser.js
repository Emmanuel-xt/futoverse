"use server";

export async function parseTikTok(url) {
  try {
    console.log("server function called", url);
    // 1️⃣ Resolve short URLs (TikTok vm links)
    const resolved = await fetch(url, { redirect: "follow" });

    console.log("resolved", resolved);
    // The final URL TikTok redirected to
    const finalUrl = resolved.url;

    // 2️⃣ Try TikTok oEmbed
    console.log("embeding...", resolved.url);
    const oembedEndpoint =
      "https://www.tiktok.com/oembed?url=" + encodeURIComponent(finalUrl);

    const oembedRes = await fetch(oembedEndpoint, {
      method: "GET",
      redirect: "follow",
    });

    console.log("Result == ", oembedRes.json());
    let oembedJson = null;
    if (oembedRes.ok) {
      oembedJson = await oembedRes.json();
    }

    // 3️⃣ Combine all the data and return
    return {
      ok: true,
      inputUrl: url,
      resolvedUrl: finalUrl,
      oembed: oembedJson,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}
