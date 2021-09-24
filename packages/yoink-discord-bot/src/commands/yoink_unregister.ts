import {SlashCommandBuilder} from '@discordjs/builders';
import {COMMAND} from './enum';

export const YoinkUnregisterCommand = new SlashCommandBuilder()
  .setName(COMMAND.YOINK_UNREGISTER)
  .setDescription(
    'Remove previously registered Twitch username from the Yoinkers',
  );
