import { prepareNewsEdition } from "../lib/posts/news-edition";

// Dry-run only. Publication requires a separate, explicitly authorized database action.
const posts = prepareNewsEdition();
if (process.argv.includes("--json")) console.log(JSON.stringify(posts));
else console.log(`Validated ${posts.length} distinct news briefs with sources and licensed cover images. No database writes performed.`);
