import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {config} from 'dotenv';
import {YoinkRegisterCommand} from './yoink_register';
import {YoinkUnregisterCommand} from './yoink_unregister';

config();

const {DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_IDS} = process.env;

const commands = [YoinkRegisterCommand, YoinkUnregisterCommand];

const rest = new REST({version: '9'}).setToken(DISCORD_TOKEN);
export const registerCommands = async (): Promise<void> => {
  try {
    console.log('Started refreshing application (/) commands.');

    for (const guildId of DISCORD_GUILD_IDS.split(',')) {
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId),
        {
          body: commands.map((command) => command.toJSON()),
        },
      );
      console.log(
        `Successfully reloaded application (/) commands for ${guildId}`,
      );
    }
  } catch (error) {
    console.error(error);
  }
};
