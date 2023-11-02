![Lotus](https://github.com/rjfranco/tea-bot/blob/9fd44d2ea4071fa5eb6f5cf3c7da99e44c7ea68c/lotus.png)
# Tea Bot
## A claudia bot to give you a karma command in slack

### Requirements
  - Node
  - Claudia
  - aws-cli

### Setup
Once you have node and the required clients, you'll need to configure your aws
credentials to include a profile that with IAM full access, Lambda full access and API Gateway Administrator privileges, then copy those keys into a local aws profile called claudia. (for details, take a peak at the [claudia installation guide](https://claudiajs.com/tutorials/installing.html))

Next, run `npm run create`, wait for that to finish, then run `npm run configure`, you'll see instructions for your slack integration here, follow them (and if you like, there's a nice little icon available in the repo you can use!)

For additional information, check out the Claudia.js and claudia-bot-builder documentation.

### Sample Claudia file
```
$> claudia.json
```
```json
{
  "lambda": {
    "role": "tea-bot-executor",
    "name": "tea-bot",
    "region": "us-east-1"
  },
  "api": {
    "id": "[yourid]",
    "module": "bot"
  }
}
```

## Usage
Alright! You should be good to go, sample commands are:

```
/karma give Janeway
```
This will give Janeway one karma

```
/karma take Kirk
```
This will take one karma from Kirk

```
/karma top
```
This will give the top 5 rated things

```
/karma bottom
```
This will give the bottom 5 rated things
