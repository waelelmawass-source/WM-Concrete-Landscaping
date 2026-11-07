# Your Concreting & Landscaping Website: How-To Guide

## 1. Put in your business details (5 minutes)
Open **`js/config.js`** and change the details at the top:

| Setting | Example |
|---|---|
| `businessName` | `"Smith Concrete & Landscapes"` |
| `phone` | `"0412 345 678"` |
| `whatsapp` | `"61412345678"`: country code 61, **drop the first 0**, no spaces or `+` |
| `email` | `"quotes@smithconcrete.com.au"` |
| `serviceArea` | `"Melbourne's South-East"` |
| `hours`, `abn`, `instagram`, `facebook` | optional |

The service names and descriptions are further down in the same file. You can edit the wording there.

**Optional hero photo:** save your best job photo as `images/hero.jpg` (landscape, about 2000px wide). It becomes the big background at the top of the page.

## 2. Put it online for free (Netlify + GitHub, about 20 minutes, one-time)
1. Create a free account at **github.com**. Click **New repository**, name it e.g. `my-website`, and click Create.
2. On the new repository page, click **"uploading an existing file"**. Drag in **everything inside this `website` folder** (not `node_modules` or `dist`, if you have them), then click **Commit changes**.
3. Create a free account at **netlify.com** and sign in with GitHub.
4. Click **Add new site → Import an existing project → GitHub** and pick `my-website`. The settings fill in automatically from `netlify.toml`. Click **Deploy**.
5. Your site is now live at an address like `something.netlify.app`. To use your own domain (e.g. `smithconcrete.com.au`), go to **Domain management → Add a domain** and follow the steps.

## 3. Get quote requests by email
In Netlify go to **Site configuration → Forms**. The form called `quote` appears after the first deploy.
- Under **Form notifications**, click **Add notification → Email notification** and enter your email.
- Each request includes the customer's details, job description, size, suburb and up to 4 photos (as links).
- You can also see every submission in the **Forms** tab.
- The free plan includes 100 submissions per month, which is plenty to start with.

## 4. Add photos of your work
Each service has its own folder inside `gallery/`:

```
gallery/synthetic-turf/        gallery/driveways/
gallery/natural-turf/          gallery/crossovers-footpaths/
gallery/planting-garden-beds/  gallery/car-parks/
gallery/retaining-walls/       gallery/slabs/
gallery/water-features/        gallery/floating-steps/
gallery/decking/               gallery/decorative-concrete/
                               gallery/steppers/
                               gallery/benchtops/
```

**To add photos (works from your phone too):**
1. On GitHub, open your repository, then `gallery`, then the right folder (e.g. `driveways`).
2. Click **Add file → Upload files**, drag in your photos, and click **Commit changes**.
3. Netlify rebuilds the site automatically. Your photos are live in about a minute, resized and optimised.

**Tips**
- The file name becomes the caption: `exposed-aggregate-driveway-frankston.jpg` shows as *"Exposed aggregate driveway frankston"*. Camera names like `IMG_1234.jpg` show no caption, just the service name.
- Start the name with a number to control the order: `01-...jpg` shows first.
- Use **.jpg** or **.png**. If an iPhone gives you .HEIC files, change the camera setting (Settings → Camera → Formats → *Most Compatible*) or export them as JPG.
- To remove a photo, open it on GitHub, click the **…** menu and choose **Delete file**.

## 5. Turn on the AI Visualiser
The visualiser uses Google's Gemini image model. Each design costs about 4–5 US cents.
1. Go to **aistudio.google.com**, sign in, and click **Get API key → Create API key**. Copy the key.
2. Set up billing on the key's Google Cloud project. **Also set a budget alert** (e.g. $20/month) so you're never surprised.
3. In Netlify go to **Site configuration → Environment variables → Add a variable**:
   - Key: `GEMINI_API_KEY`, Value: *(paste your key)*
4. Go to **Deploys → Trigger deploy → Deploy site**. Done.

By default each visitor can make 8 designs per hour. To change that, add the variable `VISUALISER_HOURLY_LIMIT`.
Until the key is added, the visualiser politely tells visitors it's coming soon.

## Previewing on your own computer (optional, for tech-savvy users)
```
npm install
npm run preview
```
On your own computer, the form and AI tool only show an error message. They work once the site is on Netlify.
