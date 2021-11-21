export interface IEvent<TArg extends object>
{
    readonly arg: TArg;
}