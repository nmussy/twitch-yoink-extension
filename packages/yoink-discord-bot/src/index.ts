import {Client, Intents} from 'discord.js';
import {config} from 'dotenv';
import {registerCommands} from './commands';
import {COMMAND} from './commands/enum';
import {S3Storage} from './storage/s3';

config();
const {DISCORD_TOKEN} = process.env;

const getClient = async () => {
  const client = new Client({intents: [Intents.FLAGS.GUILDS]});
  await client.login(DISCORD_TOKEN);

  return client;
};

const getUsername = (twitchUsername: string): string => {
  if (!twitchUsername.match(/^[a-zA-Z0-9_]{4,25}$/)) {
    throw new Error('Invalid username');
  }

  return twitchUsername.toLocaleLowerCase();
};

void (async () => {
  await registerCommands();

  const client = await getClient();
  const storage = new S3Storage();

  client.on('interactionCreate', async (interaction): Promise<void> => {
    if (!interaction.isCommand()) return;

    try {
      if (interaction.commandName === COMMAND.YOINK_REGISTER) {
        const userId = interaction.user.id;
        const twitchUsername = getUsername(
          interaction.options.getString('twitch_username'),
        );

        await interaction.deferReply();

        console.log({twitchUsername});
        const previousTwitchUsername = await storage.getKey(userId);
        console.log({twitchUsername, previousTwitchUsername});
        if (previousTwitchUsername) {
          if (previousTwitchUsername === twitchUsername) {
            interaction.editReply(
              `You had already registered \`${twitchUsername}\` previously, didn't change anything`,
            );
            return;
          }

          await storage.setKey(userId, twitchUsername);
          interaction.editReply(
            `Successfully changed from \`${previousTwitchUsername}\` to \`${twitchUsername}\``,
          );
          return;
        }

        await storage.setKey(userId, twitchUsername);
        interaction.editReply(
          `Successfully added your Twitch username \`${twitchUsername}\` to the Yoinkers`,
        );
      } else if (interaction.commandName === COMMAND.YOINK_UNREGISTER) {
        const userId = interaction.user.id;

        await interaction.deferReply();

        const twitchUsername = await storage.getKey(userId);
        if (!twitchUsername) {
          interaction.editReply(`Didn't have a Twitch`);
          return;
        }

        storage.deleteKey(userId);
        interaction.editReply(
          `Successfully removed \`${twitchUsername}\` from the Yoinkers`,
        );
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: `Something went wrong, sorry!`,
      });
    }
  });
})();
