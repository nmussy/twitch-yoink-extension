import {SlashCommandBuilder} from '@discordjs/builders';
import {COMMAND} from './enum';

export const YoinkRegisterCommand = new SlashCommandBuilder()
  .setName(COMMAND.YOINK_REGISTER)
  .setDescription(
    'Adds a badge for other Yoinkers extension users to see in Twitch chat',
  )
  .addStringOption((option) =>
    option
      .setName('twitch_username')
      .setDescription('The Twitch username you wish to link')
      .setRequired(true),
  );
