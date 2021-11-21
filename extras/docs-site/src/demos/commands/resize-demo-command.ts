import { ADemoCommand } from "./a-demo-command";
import { EDemoCommand } from "./e-demo-command";

export class ResizeDemoCommand extends ADemoCommand<{}>
{
    public id = EDemoCommand.ResizeDemo as const;
    public arg = {};
}