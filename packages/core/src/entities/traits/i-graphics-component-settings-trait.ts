/**
 * @public
 * A slot for draw options specific to the entity.
 */
export interface IGraphicsComponentSettingsTrait<TSettings extends object>
{
    graphicsSettings: TSettings;
}
