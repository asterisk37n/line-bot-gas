This line bot was developed to handle reservations status of user's work outs at a gym.

<img src="https://user-images.githubusercontent.com/16299750/47833927-aecec780-dde0-11e8-95f3-56200b9eec4c.png" width="300">

Here is a video  
[![YouTube](https://img.youtube.com/vi/KLWUtxb32gY/0.jpg)](https://www.youtube.com/watch?v=KLWUtxb32gY)


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
1. Create a Google Apps Script tied to a spreadsheet
3. Make new sheets named `reservation`, `workout`, `maxim`
5. Put any sentence in the first column in `maxim`
6. Copy `credentials.template.gs` to `credentaials.gs`
7. Set your `CHANNEL_ACCESS_TOKEN` in `credentials.gs` published from LINE dev console
8. Pase webhook URL of Google Apps Script onto your LINE dev console 🎉


Feel free to post on an issue and make a pull request 😀
