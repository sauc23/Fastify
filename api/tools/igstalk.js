import * as cheerio from "cheerio";
import fetch from "node-fetch";
import axios from "axios";
async function igStalk(username) {
  username = username.replace(/^@/, "");
  const html = await (await fetch(`https://dumpor.com/v/${username}`)).text(),
    $$ = cheerio.load(html),
    name = $$("div.user__title > a > h1").text().trim(),
    Uname = $$("div.user__title > h4").text().trim(),
    description = $$("div.user__info-desc").text().trim(),
    profilePic = $$("div.user__img").attr("style")?.replace("background-image: url('", "").replace("');", ""),
    row = $$("#user-page > div.container > div > div > div:nth-child(1) > div > a"),
    postsH = row.eq(0).text().replace(/Posts/i, "").trim(),
    followersH = row.eq(2).text().replace(/Followers/i, "").trim(),
    followingH = row.eq(3).text().replace(/Following/i, "").trim(),
    list = $$("ul.list > li.list__item");
  return {
    name: name,
    username: Uname,
    description: description,
    postsH: postsH,
    posts: parseInt(list.eq(0).text().replace(/Posts/i, "").trim().replace(/\s/g, "")),
    followersH: followersH,
    followers: parseInt(list.eq(1).text().replace(/Followers/i, "").trim().replace(/\s/g, "")),
    followingH: followingH,
    following: parseInt(list.eq(2).text().replace(/Following/i, "").trim().replace(/\s/g, "")),
    profilePic: profilePic
  };
}
export default igStalk;