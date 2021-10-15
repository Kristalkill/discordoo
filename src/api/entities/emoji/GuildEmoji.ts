import { AbstractEmoji } from '@src/api/entities/emoji/AbstractEmoji'
import { AbstractGuildEmoji } from '@src/api/entities/emoji/interfaces/AbstractGuildEmoji'
import { GuildEmojiData } from '@src/api/entities/emoji/interfaces/GuildEmojiData'
import { User } from '@src/api/entities/user'
import { resolveRoleId, resolveUserId } from '@src/utils/resolve'
import { DiscordooError, mergeNewOrSave } from '@src/utils'
import { RawGuildEmojiData } from '@src/api/entities/emoji/interfaces/RawGuildEmojiData'
import { GuildEmojiEditData } from '@src/api/entities/emoji/interfaces/GuildEmojiEditData'
import { RoleResolvable } from '@src/api/entities/role'
import { ToJsonProperties } from '@src/api/entities/interfaces/ToJsonProperties'
import { Json } from '@src/api/entities/interfaces/Json'
import { EntitiesUtil } from '@src/api'

export class GuildEmoji extends AbstractEmoji implements AbstractGuildEmoji<any /** TODO: Guild */> {
  public available!: boolean
  public guildId!: string
  public managed!: boolean
  public requiresColons!: boolean
  public roles: string[] = []
  public userId?: string
  public deleted = false

  async init(data: GuildEmojiData | RawGuildEmojiData): Promise<this> {
    await super.init(data)

    mergeNewOrSave(this, data, [
      [ 'available', '', false ],
      [ 'managed', '', false ],
      [ 'requiresColons', 'requires_colons', false ],
      [ 'guildId', 'guild_id' ],
      [ 'userId', 'user_id' ],
      [ 'deleted', '', false ],
    ])

    if (data.roles) {
      this.roles = data.roles.map(resolveRoleId)
    }

    if (data.user) {
      this.userId = resolveUserId(data.user)
    }

    return this
  }

  getGuild(): Promise<any | undefined> { // TODO: Guild
    return this.client.guilds.cache.get(this.guildId)
  }

  async getUser(): Promise<User | undefined> {
    return this.userId !== undefined ? this.client.users.cache.get(this.userId) : undefined
  }

  async fetchUser(): Promise<User | undefined> {
    if (this.managed) return undefined
    if (!this.id) return undefined

    const response = await this.client.internals.actions.getGuildEmoji(this.guildId, this.id)

    const User = EntitiesUtil.get('User')

    if (response.success) {
      await this.init(response.result)
      return new User(this.client).init(response.result.user)
    }

    return undefined
  }

  async edit(data: GuildEmojiEditData, reason?: string): Promise<this> {
    if (!this.guildId && !data.guildId) throw new DiscordooError('Emoji', 'Cannot edit emoji without guild id')
    if (!this.id && !data.id) throw new DiscordooError('Emoji', 'Cannot edit emoji without id')
    if (this.name === null) throw new DiscordooError('Emoji', 'Cannot edit emoji without name')

    const response = await this.client.internals.actions.editGuildEmoji(
      (this.guildId ?? data.guildId)!,
      (this.id ?? data.id)!,
      {
        roles: data.roles?.map(resolveRoleId),
        name: data.name ?? this.name
      },
      reason
    )

    if (response.success) {
      await this.init(response.result)
    }

    return this
  }

  setName(name: string, reason?: string): Promise<this> {
    return this.edit({ name }, reason)
  }

  setRoles(roles: RoleResolvable[], reason?: string): Promise<this> {
    return this.edit({ roles }, reason)
  }

  async delete(reason?: string): Promise<this> {
    if (!this.guildId) throw new DiscordooError('Emoji', 'Cannot delete emoji without guild id')
    if (!this.id) throw new DiscordooError('Emoji', 'Cannot delete emoji without id')

    const response = await this.client.internals.actions.deleteGuildEmoji(this.guildId, this.id, reason)

    if (response.success) {
      this.deleted = true
    }

    return this
  }

  toJson(properties: ToJsonProperties, obj?: any): Json {
    return super.toJson({
      ...properties,
      available: true,
      guildId: true,
      managed: true,
      requiresColons: true,
      roles: true,
      userId: true,
      deleted: true,
    }, obj)
  }

}
