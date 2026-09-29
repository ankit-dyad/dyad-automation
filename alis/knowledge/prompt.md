Reusable Prompt — ALIS UI Knowledge Base Documentation
Use this with Claude in Chrome, on the ALIS UAT tab, to document any screen/section as a knowledge-base markdown file for the automation framework. Copy the block below, swap in the section name and filename, and send it.


Prompt template
I want to create a knowledge base document for the [SECTION NAME] on this page

(e.g. "the header", "the Follow Up list's filter bar and grid", "the search

sidebar opened by the green + icon"). Save it as [FILENAME].md.

Please:

- Give a short overview (what this section is, where it appears, what module/

  page it belongs to).

- Describe the layout left-to-right / top-to-bottom: every control, field,

  button, icon, and column, in plain language.

- For each dropdown, checkbox, or filter: list its actual options/values as

  observed on the page (don't guess).

- For any icon-only button without a visible label or tooltip: say so

  explicitly, describe it by its glyph, and note that its exact function is

  unverified rather than assuming what it does.

- Note any interesting behavior you notice while inspecting (e.g. inline

  editing on click, hidden columns, tooltips) as its own callout.

- End with an "Open items / to verify" list for anything you couldn't

  confirm without performing an action you're not able to do

  (submitting a form, entering credentials, clicking into a record, etc.).

- Do NOT include element IDs, CSS selectors, XPaths, or other locators —

  those are tracked separately.

- Do NOT log in, submit forms, or change any data — read-only inspection

  only (screenshots, page-read tools). If you need to click something to

  see what it opens (a menu, a panel, a dropdown), that's fine as long as

  it doesn't submit or save anything; back out (Escape / close) if you

  land in an edit state by accident.

Deliver it as a .md file.
Tips for getting good results
Be on the actual page/section before sending the prompt — Claude can only document what's currently on screen (plus anything it opens by clicking, per the rules above).
If the section has many columns or a long scrolling grid, add a line like "scroll horizontally/vertically and capture everything" — Claude won't otherwise know there's more off-screen.
If you want a specific filename or you're building up a set of files (login.md, header.md, etc.), say so explicitly — Claude will keep using that name across follow-ups in the same conversation.
To exclude something you're tracking separately (like we did with locators, and with the Actions/Add Follow Up buttons), say so up front — Claude will note it as a stub rather than skip it silently.
Never share real login credentials in a shared prompt/document like this one — for a shared team resource, point teammates to wherever your team's UAT credentials are actually stored, rather than pasting them in chat.
Example follow-ups that worked well in this session
"Same for [next section]" — reuses the same style for a new part of the page.
"Locators, will manage separately, so don't add in knowledge file" — a standing instruction Claude carried forward.
"We can scroll horizontally and check Columns" — pointed Claude at content that was off-screen, which it then added into the existing file rather than creating a new one.

