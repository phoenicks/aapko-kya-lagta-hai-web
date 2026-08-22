AAPKO KYA LAGTA HAI — ANDROID APP
=====================================

WHAT THIS IS
=============
A native Android app wrapper for aapkokyalagtahai.com, built with
Capacitor. It's a thin shell: there's no separate app content to maintain
— the app opens a real Android WebView and points it straight at your
live site. Whatever's deployed on the website is what shows up in the
app, automatically, with no separate app release needed when you ship a
normal web update. Only things that are genuinely native (the app icon,
the splash screen, back-button behavior, opening external links) live in
this project.

Package ID (permanent once you upload to Play Store): com.aapkokyalagtahai.app
App display name: Aapko Kya Lagta Hai


WHAT'S BUILT IN
=================
- Loads https://aapkokyalagtahai.com directly — any update you push to
  the website shows up in the app right away, no app update needed.
- App icon + adaptive icon (the thumbs up / thumbs down mark, in your
  site's brand colors) and a matching splash screen — see "About the
  icon" below.
- Hardware/gesture back button steps back through the site's own history
  (e.g. from a debate back to the feed) instead of just closing the app,
  and only exits once there's nowhere left to go back to.
- Links outside your domain — Amazon affiliate links, WhatsApp share
  links — automatically open in the system browser or the relevant app
  (Amazon app, WhatsApp) instead of getting stuck inside the wrapper.
  This is Capacitor's built-in behavior, not custom code: anything
  outside aapkokyalagtahai.com / *.aapkokyalagtahai.com falls outside the
  app's allowed navigation list and gets handed to Android's normal
  "open with" mechanism.
- "Share result" on a vote card uses Android's native share sheet, same
  as it would in Chrome (there's one narrow fallback path in the site's
  code — a manual download link — that's used only on very outdated
  Android WebView versions and isn't wired up to Android's Download
  manager in this wrapper; realistically this won't affect real users on
  a modern phone).

I also caught and fixed one thing that would have broken the build
outright: the Capacitor Android template ships with app/build.gradle's
theme referencing three color resources (colorPrimary, colorPrimaryDark,
colorAccent) that were never actually defined anywhere in a fresh
project. I added them (values/colors.xml) using your site's palette —
black for primary (also sets the status bar color to match), your vote
blue for the accent.


ABOUT THE ICON
=================
Per your call to go with a placeholder for now: I designed a simple
thumbs-up / thumbs-down mark (blue up, red down — pulled directly from
your site's --up-color / --down-color) on a black background, matching
the core voting mechanic of the app. It's built to be legible at small
sizes, which is what actually matters for a launcher icon. Swap it for
real branding whenever you're ready — the source files are in
store-assets/ and android/app/src/main/res/mipmap-*/ if you want a
designer to work from them, or just replace the PNGs directly.


HOW TO GET AN INSTALLABLE APP
================================
I couldn't compile this into an actual .apk myself — the environment I
work in doesn't have the Android SDK available (its network access is
locked down to a small allowlist that doesn't include Google's SDK/Maven
servers). So I set up something that gets you a real, tested build
without needing Android Studio installed anywhere.

This copy of the project is packaged to live at android-app/ inside your
existing phoenicks/aapko-kya-lagta-hai-web repo, alongside the website
code — NOT at the repo root, so it can't collide with the website's own
package.json/package-lock.json (which Vercel reads to build the site).

STEP 1 — Upload everything in this zip into android-app/
   On github.com, open the repo, click "Add file" → "Create new file",
   type "android-app/placeholder.txt" as the filename (this is just a
   trick to make GitHub create the folder — delete this file once real
   files are in place, or skip it and just drag a folder named
   "android-app" containing everything from this zip straight into the
   repo's file browser — GitHub supports dragging whole folders in the
   browser and will recreate the path automatically).

   If you're comfortable with git instead, this is more reliable than
   the web UI for this many files:
     cd path/to/your/existing/repo/checkout
     mkdir android-app
     cp -r path/to/unzipped/contents/* android-app/
     cp -r path/to/unzipped/contents/.gitignore android-app/
     git add android-app
     git commit -m "Add Android app wrapper"
     git push

STEP 2 — Add the GitHub Actions workflow file (separately, at the repo root)
   This is the one piece that CANNOT live inside android-app/ — GitHub
   only runs workflow files that sit at .github/workflows/ at the repo's
   actual root, not inside a subfolder. I've given you the exact content
   to use for this in the chat message alongside this zip — on
   github.com, "Add file" → "Create new file", type the filename
   ".github/workflows/android-build.yml" (typing the slashes creates the
   folders automatically), paste in that content, and commit.

STEP 3 — Let GitHub Actions build it
   Once both android-app/ and the workflow file are in place, push (or
   just open the repo's "Actions" tab and run "Build Android app"
   manually — that works even without waiting for a new push). It
   compiles a debug APK on GitHub's servers — takes 2-4 minutes. Note:
   because the workflow is scoped to only trigger on changes under
   android-app/**, ordinary website pushes won't set off an Android
   build.

STEP 4 — Download and install the APK
   Once the run finishes (green checkmark), open that run in the Actions
   tab, and under "Artifacts" download "aapko-kya-lagta-hai-debug-apk".
   Unzip it to get app-debug.apk, transfer it to an Android phone (email,
   Drive, USB — any way you like), and tap it to install. Android will
   warn about installing from an unknown source the first time — that's
   normal for a debug build not yet on the Play Store; allow it just for
   this install.

This debug APK is genuinely installable and testable right now — it's
signed with Android's default debug key, which is fine for your own
testing but not for a Play Store upload.

A note on sharing one repo with the website: Vercel is set to redeploy
on pushes to this repo's main branch. Pushing android-app/ changes alone
won't break anything (Vercel just rebuilds the unchanged website), but
it will trigger a redundant website redeploy each time. Harmless, just
a few wasted build minutes — not worth worrying about unless it starts
adding up, in which case Vercel's "Ignored Build Step" setting can skip
deploys where only android-app/ changed.


GETTING IT ONTO THE PLAY STORE
=================================
This part needs an actual signing key tied to your identity, which is
exactly the kind of thing that should happen on a machine you control —
so this is a manual step, done once, in Android Studio:

1. Install Android Studio (free, from developer.android.com/studio) and
   open the "android-app/android" folder from your repo checkout —
   Android Studio opens Capacitor Android projects natively, no extra
   setup.
2. Build → Generate Signed Bundle / APK → choose "Android App Bundle"
   (this is the .aab format Play Store requires for new apps).
3. Click "Create new..." to generate your upload keystore — Android
   Studio walks you through it (key alias, password, your name/org for
   the certificate). SAVE THIS KEYSTORE FILE AND ITS PASSWORDS SOMEWHERE
   SAFE — you'll need the exact same one for every future update; losing
   it means you can't update this app listing ever again.
4. Choose "release" build variant, finish the wizard. Android Studio
   produces a signed .aab file.
5. Go to https://play.google.com/console, create a new app, and in
   "Production" (or "Internal testing" first, which I'd recommend for
   your first upload) → "Create new release", upload the .aab file.
6. Fill in the store listing:
   - App icon: store-assets/play_store_icon_512.png (included)
   - Feature graphic: store-assets/feature_graphic_1024x500.png (included)
   - Screenshots: take a few from the debug APK running on a phone/
     emulator — Play Console requires at least 2.
   - Short description / full description: write these based on your
     site's own copy (app/layout.js's metadata.description is a good
     starting point).
   - Privacy policy URL: https://aapkokyalagtahai.com/privacy — you
     already have a real one live on the site, so this is done.
7. Fill in the "Data safety" questionnaire (Play Console requires this
   for every app) — based on your privacy policy, you're not collecting
   personally identifying data; you're using an anonymous session cookie
   and, per the geo-capture feature, coarse city/region/country from the
   request. Answer accordingly.
8. Submit for review. Google's review for a first submission commonly
   takes anywhere from a few hours to a few days.


ABOUT YOUR GOOGLE PLAY DEVELOPER ACCOUNT
============================================
I can't check whether mail.nikhilsharma@gmail.com already has a Play
Developer account set up — that lives entirely inside your Google
account and I have no way to look at it from here. To check yourself:
go to https://play.google.com/console signed in as that account. If you
see a dashboard with (possibly zero) apps listed, you already have one.
If you're prompted to pay the one-time $25 registration fee and provide
identity verification, you don't yet — that process usually takes from
a few minutes up to a couple of days if identity verification is
required.


A NOTE ON "app store"-STYLE PROMOTION ON YOUR WEBSITE
=========================================================
Once this is live on the Play Store, a good next step (not done in this
delivery) is a small banner/link on the website itself ("Get the app")
pointing mobile visitors to the Play Store listing — happy to build that
whenever you're ready, along with push notifications if you want to
revisit that (this delivery intentionally left push notifications out,
per your call to do the wrapper first).


WHAT'S IN THIS ZIP
=====================
Everything here is meant to land inside android-app/ in your existing
repo (see Step 1 above) — the GitHub Actions workflow is the one
exception, given to you separately since it must sit at the real repo
root.

capacitor.config.ts       — points the app at your live site, domain
                             allowlist, brand background color
android/                  — the full native Android Studio project
store-assets/             — Play Store listing icon (512x512) and
                             feature graphic (1024x500)
www/                      — a one-line fallback page (only shown for a
                             flash if the app ever can't reach the site)
package.json / package-lock.json — only Capacitor's own tooling
                             dependencies; unrelated to and won't
                             conflict with the website's own package.json
                             at the repo root as long as this whole
                             folder stays inside android-app/
