import React, { useMemo, useState } from "react";
import { _Array, TTypedArrayCtor } from "rc-js-util";
import { TDemoEvents } from "../events/t-demo-events";
import { MinimizeDemoEvent } from "../events/minimize-demo-event";
import { PlotSetAxisEvent } from "../../cartesian2d-plot/commands/plot-set-axis-event";
import { CloseFullscreen, MenuOpen, Restore } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { ICartesianPlotOptions } from "../../cartesian2d-plot/i-cartesian-plot-options";
import { ProxyPlotCommand } from "../events/proxy-plot-command";
import { IPlotRange, TUnknownRenderer } from "@visualization-tools/core";
import { ResetDemoEvent } from "../events/reset-demo-event";
import { EntitySelectionChangedEvent } from "../events/entity-selection-changed-event";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { TPlotCommands } from "../../cartesian2d-plot/commands/t-plot-commands";

export interface ICartesian2dPlotControlsProps<TRenderer extends TUnknownRenderer
    , TArrayCtor extends TTypedArrayCtor
    , TTraits>
{
    plotOptions: ICartesianPlotOptions<TRenderer, TArrayCtor, TTraits>;
    emitEvent: ($event: TDemoEvents<TTraits>) => void;
    entities: readonly TTraits[];
    selection: ReadonlySet<TTraits>;
}

export function Cartesian2dPlotControlsComponent<TRenderer extends TUnknownRenderer
    , TArrayCtor extends TTypedArrayCtor
    , TTraits>
(
    props: ICartesian2dPlotControlsProps<TRenderer, TArrayCtor, TTraits>,
)
    : JSX.Element
{
    const [drawerOpenState, setDrawerOpenState] = useState<boolean>(false);
    const isLogX = props.plotOptions.options.plotRange.userTransform.xTransformEnabled;
    const isLogY = props.plotOptions.options.plotRange.userTransform.yTransformEnabled;
    const emitProxyCommand = ($event: TPlotCommands<IPlotRange, TTraits>) => props.emitEvent(new ProxyPlotCommand($event));
    const rows = _Array.map(props.entities, (entity, index) =>
    {
        const selected = props.selection.has(entity);

        return useMemo(() =>
        {
            const onRowClicked = () =>
            {
                const newSelection = new Set(props.selection);
                const added: TTraits[] = [];
                const removed: TTraits[] = [];

                if (selected)
                {
                    newSelection.delete(entity);
                    removed.push(entity);
                }
                else
                {
                    newSelection.add(entity);
                    added.push(entity);
                }

                props.emitEvent(new EntitySelectionChangedEvent({
                    newSelection: newSelection,
                    addedEntities: added,
                    removedEntities: removed,
                }));
            };

            return (
                <TableRow key={index} onClick={() => onRowClicked()}>
                    <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={selected}/>
                    </TableCell>
                    <TableCell component="th" scope="row">Entity {index}</TableCell>
                </TableRow>
            );
        }, [entity, selected]);
    });

    return (
        <React.Fragment>
            <nav className="minimal-component chart-controls">
                <Button variant="outlined" onClick={() => props.emitEvent(new MinimizeDemoEvent())}><CloseFullscreen/></Button>
                <Button variant="outlined" onClick={() => setDrawerOpenState(true)}><MenuOpen/></Button>
                <Button variant="outlined" onClick={() => props.emitEvent(new ResetDemoEvent())}><Restore/></Button>
            </nav>
            <Drawer anchor="right" open={drawerOpenState} onClose={() => setDrawerOpenState(false)}>

                <Typography>Axis</Typography>
                <FormGroup>
                    <FormControlLabel control={
                        <Switch checked={isLogX} onChange={() => emitProxyCommand(new PlotSetAxisEvent({ logX: !isLogX }))}/>
                    } label="Log x"/>
                    <FormControlLabel control={
                        <Switch checked={isLogY} onChange={() => emitProxyCommand(new PlotSetAxisEvent({ logY: !isLogY }))}/>
                    } label="Log y"/>
                </FormGroup>

                <Typography>Entities</Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 80 }} size="small">
                        <TableBody>{rows}</TableBody>
                    </Table>
                </TableContainer>

            </Drawer>
        </React.Fragment>
    );
}