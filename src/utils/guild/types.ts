//A module for defining types related to channels in a guild


export enum channel_types {
  TEXT = "GUILD_TEXT",
  VOICE = "GUILD_VOICE",
}

export type Channel = {
  id: string;
  name: string;
  guild_id: string;
  type: channel_types;
};