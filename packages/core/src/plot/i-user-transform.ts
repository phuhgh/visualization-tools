/**
 * @public
 * Base user transform, defines a symbol which transform components can use to indicate they are appropriate for that
 * transform
 */
export interface IUserTransform
{
    userTransformId: symbol;
}