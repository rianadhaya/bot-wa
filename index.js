const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");
const sharp = require("sharp");

const ffmpeg = require("fluent-ffmpeg");
try {
    const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
    if (fs.existsSync(ffmpegPath)) {
        ffmpeg.setFfmpegPath(ffmpegPath);
    } else {
        console.log("ffmpeg-installer path not found, using system ffmpeg.");
    }
} catch (e) {
    console.log("ffmpeg-installer not found or failed, using system ffmpeg.");
}

const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const http = require("http");

// ===== HTTP SERVER (For Health Checks) =====
const PORT = process.env.PORT || 7860;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running!\n");
}).listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// ===== LOAD HSR (TIDAK DIUBAH) =====
let hsrData = {};
try {
    hsrData = JSON.parse(fs.readFileSync("./hsr_data.json", "utf-8"));
} catch {}


// ===== BOT =====
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        if (update.qr) qrcode.generate(update.qr, { small: true });
    });

    sock.ev.on("messages.upsert", async (msg) => {
        const m = msg.messages[0];
        if (!m.message) return;
        if (m.key.fromMe) return;

        const from = m.remoteJid || m.key.remoteJid;

        const sender = (m.key.participant || m.key.remoteJid || "").split(":")[0];

        const text =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            m.message.imageMessage?.caption ||
            m.message.videoMessage?.caption ||
            "";

        const args = text.split(" ");
        const cmd = args[0]?.toLowerCase();
        const sub = args[1]?.toLowerCase();

        // ===== MENU =====
        if (cmd === "!menu") {
            return await sock.sendMessage(from, {
                text:
                    "Haiii~ aku Zayla 💖\n\n" +
                    "📥 !save <url> (TikTok, YT, IG)\n" +
                    "✨ !hsr\n" +
                    "🖼️ !stiker\n" +
                    "🎥 !gif\n\n" +
                    "Jadi mau yang mana??"
            });
        }

        // ===== SAVE MEDIA (TikTok, YT, IG) =====
        if (cmd === "!save") {
            const url = args[1];
            if (!url) return await sock.sendMessage(from, { text: "⚠️ Berikan URL ya kak! Contoh: !save https://tiktok.com/..." });

            await sock.sendMessage(from, { text: "⏳ Sedang memproses media HD kamu, tunggu sebentar ya... 😆💖" });

            const tempPrefix = `save_${Date.now()}`;
            
            // --- KHUSUS TIKTOK (PAKAI API TIKWM) ---
            if (url.includes("tiktok.com")) {
                const tikwmCommand = `curl -X POST https://www.tikwm.com/api/ -d "url=${url}"`;
                
                exec(tikwmCommand, async (error, stdout) => {
                    try {
                        const res = JSON.parse(stdout);
                        if (res.code === 0 && res.data && res.data.play) {
                            const videoUrl = res.data.play;
                            const filePath = path.join(__dirname, `${tempPrefix}.mp4`);
                            const downloadCmd = `curl -L -o "${filePath}" "${videoUrl}"`;
                            
                            exec(downloadCmd, async (dlError) => {
                                if (dlError) throw dlError;
                                
                                await sock.sendMessage(from, {
                                    video: fs.readFileSync(filePath),
                                    caption: `✨ Nih videonya kak! HD banget kan~ 😆💖\n\nTitle: ${res.data.title || "-"}`
                                });
                                fs.unlinkSync(filePath);
                            });
                        } else {
                            throw new Error("TikWM API failed");
                        }
                    } catch (err) {
                        console.error("TikTok API Error, falling back to yt-dlp:", err.message);
                        downloadMedia(url, from, tempPrefix, sock, "tiktok");
                    }
                });
            } 
            // --- INSTAGRAM (DIBUAT LEBIH LONGGAR BIAR BISA FOTO) ---
            else if (url.includes("instagram.com")) {
                downloadMedia(url, from, tempPrefix, sock, "instagram");
            }
            // --- YOUTUBE & LAINNYA (PAKSA MP4 COMPATIBLE) ---
            else {
                downloadMedia(url, from, tempPrefix, sock, "video");
            }

            return;
        }

        // Helper function yang lebih robust
        async function downloadMedia(url, from, tempPrefix, sock, type) {
            let ytFlags = "";
            const outputPath = path.join(__dirname, `${tempPrefix}.%(ext)s`);

            if (type === "instagram") {
                // Jangan paksa format video biar foto bisa tembus
                ytFlags = `--no-playlist`;
            } else {
                // Paksa MP4 H.264 + AAC biar pasti bisa diputar di WhatsApp
                ytFlags = `-f "bv[vcodec^=avc1]+ba[acodec^=mp4a]/b[ext=mp4]/b" --merge-output-format mp4 --no-playlist`;
            }

            const ytCommand = `yt-dlp ${ytFlags} -o "${outputPath}" "${url}"`;

            exec(ytCommand, async (error) => {
                if (error) {
                    // --- FALLBACK KHUSUS INSTAGRAM FOTO ---
                    if (type === "instagram") {
                        console.log("yt-dlp failed for IG, trying direct photo fallback...");
                        const igId = url.split("/p/")[1]?.split("/")[0] || url.split("/reel/")[1]?.split("/")[0];
                        if (igId) {
                            const fallbackUrl = `https://www.instagram.com/p/${igId}/media/?size=l`;
                            const fallbackPath = path.join(__dirname, `${tempPrefix}.jpg`);
                            const curlCmd = `curl -L -s -o "${fallbackPath}" "${fallbackUrl}"`;
                            
                            exec(curlCmd, async (curlErr) => {
                                if (!curlErr && fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).size > 1000) {
                                    await sock.sendMessage(from, {
                                        image: { url: fallbackPath },
                                        caption: "✨ Nih fotonya kak! Ternyata tadi itu foto ya, bukan video~ 😆💖"
                                    });
                                    fs.unlinkSync(fallbackPath);
                                    return;
                                } else {
                                    if (fs.existsSync(fallbackPath)) fs.unlinkSync(fallbackPath);
                                    return await sock.sendMessage(from, { text: "❌ Maaf kak, gagal mendownload foto/video IG tersebut. Mungkin di-private? 🥺" });
                                }
                            });
                            return;
                        }
                    }
                    
                    console.error("yt-dlp error:", error.message);
                    return await sock.sendMessage(from, { text: "❌ Maaf kak, gagal mendownload media tersebut. Mungkin link-nya diprivate atau nggak didukung. 🥺" });
                }

                try {
                    const files = fs.readdirSync(__dirname).filter(f => f.startsWith(tempPrefix));
                    if (files.length > 0) {
                        const downloadedFile = files[0];
                        const filePath = path.join(__dirname, downloadedFile);
                        
                        // Deteksi apakah ini video (mp4, webm, dll) atau bukan (jpg, png, wep)
                        const isVideo = /\.(mp4|webm|mkv|mov|avi)$/i.test(downloadedFile);

                        if (isVideo) {
                            await sock.sendMessage(from, {
                                video: fs.readFileSync(filePath),
                                caption: "✨ Nih videonya kak! Happy watching~ 😆💖"
                            });
                        } else {
                            await sock.sendMessage(from, {
                                image: { url: filePath },
                                caption: "✨ Nih fotonya kak! HD banget kan~ 😆💖"
                            });
                        }
                        fs.unlinkSync(filePath);
                    } else {
                        await sock.sendMessage(from, { text: "❌ File tidak ditemukan setelah proses selesai. 🥺" });
                    }
                } catch (sendError) {
                    console.error("Send error:", sendError);
                    const files = fs.readdirSync(__dirname).filter(f => f.startsWith(tempPrefix));
                    files.forEach(f => { try { fs.unlinkSync(path.join(__dirname, f)); } catch {} });
                    await sock.sendMessage(from, { text: "❌ Gagal mengirim file ke WhatsApp. 🥺" });
                }
            });
        }

        // ===== HSR (TIDAK DIUBAH SAMA SEKALI) =====
        if (cmd === "!hsr") {

            if (!sub) {
                const list = Object.keys(hsrData).slice(0, 50).map(x => `🔹 !hsr ${x}`).join("\n");
                const footer = Object.keys(hsrData).length > 50 ? `\n\n...dan ${Object.keys(hsrData).length - 50} karakter lainnya!` : "";
                
                return await sock.sendMessage(from, {
                    text:
                        "✨ *HSR Wiki Zayla* 💖\n\n" +
                        "Ketik !hsr <nama_karakter>\n\n" +
                        list + footer
                });
            }

            const query = args.slice(1).join("").toLowerCase().replace(/[^a-z0-9]/g, "");
            let char = hsrData[query];

            if (!char) {
                const key = Object.keys(hsrData).find(k => 
                    k.includes(query) ||
                    hsrData[k].name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(query)
                );
                if (key) char = hsrData[key];
            }

            if (!char) {
                return await sock.sendMessage(from, {
                    text: "Hehe aku ga punya data itu 😅"
                });
            }

            await sock.sendMessage(from, {
                image: { url: char.image },
                caption:
                    `✨ ${char.name} 💖\n\n` +
                    `📖 ${char.desc}\n\n` +
                    `⚔️ Build:\n` +
                    `🔸 ${char.build.lightcone}\n` +
                    `🔸 ${char.build.relic}\n` +
                    `🔸 ${char.build.stats}\n\n` +
                    `💡 ${char.build.tips}`
            });

            return;
        }

        // ===== STIKER =====
        if (m.message.imageMessage && cmd === "!stiker") {
            const stream = await downloadContentFromMessage(
                m.message.imageMessage,
                "image"
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const webp = await sharp(buffer)
                .resize(512, 512)
                .webp()
                .toBuffer();

            return await sock.sendMessage(from, {
                sticker: webp
            });
        }

        // ===== GIF =====
        if (m.message.videoMessage && cmd === "!gif") {
            const stream = await downloadContentFromMessage(
                m.message.videoMessage,
                "video"
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            fs.writeFileSync("in.mp4", buffer);

            await new Promise((res, rej) => {
                ffmpeg("in.mp4")
                    .outputOptions([
                        "-vcodec libwebp",
                        "-vf scale=512:512,fps=15"
                    ])
                    .save("out.webp")
                    .on("end", res)
                    .on("error", rej);
            });

            const out = fs.readFileSync("out.webp");

            fs.unlinkSync("in.mp4");
            fs.unlinkSync("out.webp");

            return await sock.sendMessage(from, {
                sticker: out
            });
        }

        // Fitur AI chat telah dihapus
    });
}

startBot();