This line bot was developed to handle reservations status of user's work outs at a gym.

<img src="https://user-images.githubusercontent.com/16299750/47833927-aecec780-dde0-11e8-95f3-56200b9eec4c.png" width="300">

# Features
- You can create a reservation.
- You can view your reservations.
- You can delete your reservations
- Reservations can have min-date and max-date when making.
- Invalid reservations are rejected when making a reservation.
- You can add video to count your workouts
- You can view your workouts
- An administrator can show all reservations
- An administrator can show all workouts of users

# To start your LINE bot
1. Create spreadsheet
2. Open Google Apps Script tied to the spreadsheet
3. Fork this repository to your GitHub account and pull into Google Apps Script
4. Make sheets named reservation, workout, maxim
5. Put some sentences at the first column in maxim
6. cp credentials.template.gs credentaials.gs
7. CHANNEL_ACCESS_TOKEN published from LINE dev console
8. Put webhook URL of Google Apps Script onto LINE dev console 😃
