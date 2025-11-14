# 1.2.1

- tests: add automated e2e tests
- fix: autoreconnect channels (remove server hook handleRoom and fetch data on reconnect)
- refactor: move protips to dedicated component
- fix: set cookie userId maxAge
- feat: can rejoin the room using the same userId

# 1.2.0

- Fix username mandatory (insert user on create/join)
- Improve UI : copy to clipboard (italic)
- Show min/max
- Highlight out of mean users

# 1.1.0

- Change value after show votes
  - should update team stats
- Add a "?" besides column title to show a "pro tips"
- Add some guards to prevent access to the room directly

# 1.0.0

- Home page
  - User can choose a username
  - User can create a new room
  - User can navigate to about page
- Voting session page
  - Have a dedicated chat
    - To show room events (users joined/left, user showned/cleared votes)
    - Have a message with invite link
      - Click on invite link add it to clipboard
  - Have a User status section
    - Displays all user connected
    - Have a voted indicator by category
  - Have the vote table
    - Click on cell to vote
  - Have a stats/results section
    - show my mean value and point value over the mean
    - show team mean value and point value over the mean
- Joining page
  - Same layout as home page
  - User can choose a username
  - User join the room
- About page
  - Have a disclaimer message : rooms/data expired
- Auto delete data (24h)
- English and French languages

# Backlog

- Use chat to notify when user changes votes if show votes enabled
- Improve chat UI : add username on message
- Push messages "Team recommanded value : X"
- Have state voteShown in db : join room already shown
- Add a timer
  - Auto start
  - Stop on show votes
  - Reset on clear votes
- chose another preset on create room (use another scale/color)
- Password protected rooms
- Add a how to use section in about page
  - Click on table
  - Discuss to reach consensus
- use ReadableStream / EventSource
- conventional commit again
  - https://dev.to/ghacosta/definitive-guide-for-commitizen-commitlint-husky-3of9
  - https://commitlint.js.org/reference/rules.html
  - https://commitizen-tools.github.io/commitizen/
- add https://logflare.app/
- Use boundary https://svelte.dev/docs/svelte/svelte-boundary
