// convert.mjs
import fs from "node:fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/666zmy/MoonTV/refs/heads/main/config.json";

function isEnglish(str) {
  return /^[A-Za-z]/.test(str.trim());
}

async function main() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch source config: ${res.status} ${res.statusText}`
    );
  }

  const raw = await res.json();

  const apiSite = raw.api_site || {};

  const sites = Object.values(apiSite)
    .map((item) => ({
      id: "",
      key: item.name || "",
      name: item.name || "",
      api: item.api || "",
      type: 2,
      isActive: 1,
      time: "",
      isDefault: 0,
      remark: "",
      tags: [],
      priority: 0,
      proxyMode: "none",
      customProxy: "",
    }))
    .sort((a, b) => {
      const na = a.name || "";
      const nb = b.name || "";

      const aEng = isEnglish(na);
      const bEng = isEnglish(nb);

      // 英文排中文前面
      if (aEng && !bEng) return -1;
      if (!aEng && bEng) return 1;

      // 英文内部排序
      if (aEng && bEng) {
        return na.localeCompare(nb, "en", { sensitivity: "base" });
      }

      // 中文内部排序
      return na.localeCompare(nb, "zh-Hans-CN", { sensitivity: "base" });
    });

  const output = { sites };

  await fs.writeFile("sites.json", JSON.stringify(output, null, 2), "utf8");
  console.log("Generated sites.json with", sites.length, "items");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
