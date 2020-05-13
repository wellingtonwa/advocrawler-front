import React, { useEffect, useReducer, useRef } from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column'
import configs from '../constants/configs.json';
import {Button} from 'primereact/button';
import {Growl} from 'primereact/growl';
import {Dropdown} from 'primereact/dropdown';
import {Checkbox} from 'primereact/checkbox';
import { Diligencia } from '../models/ger/dto/diligencia';
import { Status } from '../models/ger/dto/status';

const configuracao = () => JSON.parse(JSON.stringify(configs));

interface DiligenciaViewState {
    loading: boolean;
    alterarStatus: boolean;
    diligencias: Diligencia[];
    selecionados: Diligencia[];
    status: Status[];
    statusSelecionado: Status;
};

const initialState:DiligenciaViewState = { 
    loading: true, 
    alterarStatus: false,
    diligencias: [],
    selecionados: [],
    status: [],
    statusSelecionado: {}
}

 const reducer = (state:DiligenciaViewState, action:any) => {
     switch(action.type) {
        case 'toggle-loading':
            return { ...state, loading: !state.loading };
        case 'set-diligencias':
            return { 
                ...state, 
                diligencias: action.payload.diligencias,
                status: action.payload.listaStatus
            };
        case 'set-selection':
            return { ...state, selecionados: action.payload };
        case 'set-status-selecionado':
            return {...state, statusSelecionado: action.payload}
        case 'set-alterar-status':
            return {...state, alterarStatus: !state.alterarStatus}
        default:
            return state;
     }
 }

const jsonHeader =  {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

const DiligenciaView = (props: any) => {

    const [state, dispatch] = useReducer(reducer, initialState);
    const growl = useRef(null);

    useEffect(() => {
        console.log("asdaslj", configuracao().server_url);
        fetch(`${configuracao().server_url}/diligencia`, { method: 'GET' })
        .then(async response => {
            dispatch({type: 'toggle-loading'});
            dispatch({type: 'set-diligencias', payload: await response.json()});
        })
    }, []);

    const onSelectHandler = (valor:any) => {
        dispatch({type: 'set-selection', payload: valor});
    }

    const displaySelection = (data:any) => {
        if(!data || data.length === 0) {
            return <div style={{textAlign: 'left'}}>No Selection</div>;
        }
        else {
            if(data instanceof Array)
                return <ul style={{textAlign: 'left', margin: 0}}>{data.map((dili,i) => <li key={dili.link}>{dili.descricao}</li>)}</ul>;
            else
                return <div style={{textAlign: 'left'}}>Diligênia selecionada: {data.descricao}</div>
        }
    }

    const buscarInformacao = () => {
        if (state.alterarStatus && !(state.statusSelecionado && state.statusSelecionado.id)) {
            //@ts-ignore
            growl.current.show({severity:'warn', summary:'Atenção', detail:'É necessário selecionar o status que o sistema deverá alterar'});
        } else {
            //@ts-ignore
            growl.current.show({severity:'info', summary:'Informação', detail:'buscando informações'});
            const dadosParaEnviar = state.selecionados.map((dili:any) => ({...dili, ...{alterarStatus: state.alterarStatus, idStatus: state.statusSelecionado.id}}));
            
            dispatch({type: 'toggle-loading'});
            fetch(`${configuracao().server_url}/diligencia/buscar-dados`, {
                method: 'POST',
                headers: jsonHeader,
                body: JSON.stringify(dadosParaEnviar)
            }).then(async resp => {
                const url = window.URL.createObjectURL(await resp.blob());
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'excel.xlsx'); //or any other extension
                document.body.appendChild(link);
                link.click();
                dispatch({type: 'toggle-loading'});
            })
            .catch((error) => console.log(error));
        }
        
    }
    
    const changeStatusHandle = (e:any) => {
        dispatch({type: 'set-status-selecionado', payload: e.value});
    }
    
    const changeAlterarStatusHandle = (e:any) => {
        dispatch({type: 'set-alterar-status'});
    }

    return <>

        <div className="p-grid p-fluid dashboard">
            <Growl ref={growl} />
            <div className="card card-w-title">
                <h1>Diligências{state.loading && <p>Carregando... aguarde por favor</p>}</h1>
                <DataTable value={state.diligencias} paginatorPosition="both" header="Lista de Diligências"
                    footer={displaySelection(state.selecionados)}
                    responsive={true} selection={state.selecionados} onSelectionChange={event => onSelectHandler(event.value)}>
                    <Column selectionMode="multiple" style={{width:'4em'}}/>
                    <Column field="descricao" header="Nome Diligência" sortable={true}/>
                </DataTable>
                {state.diligencias && state.selecionados && 
                    <>   
                        <div className="mt-5 flex">
                            <div className="px-4 w-1/2">
                                <Checkbox inputId="alterar-status" onChange={changeAlterarStatusHandle} checked={state.alterarStatus}/>
                                <label htmlFor="alterar-status" className="p-checkbox-label">Alterar status dos clientes</label>
                            </div>
                            <div className="px-4 w-1/2">
                                <Dropdown options={state.status} value={state.statusSelecionado} ariaLabel="Status do cliente" onChange={changeStatusHandle} placeholder="Selecione um status" optionLabel="titulo" style={{width: '12em'}} disabled={!state.alterarStatus}/>
                            </div>
                            <div className="px-4 w-1/2">
                                <Button label="Buscar informações" onClick={buscarInformacao} disabled={state.loading || (state && !state.selecionados.length)}/>
                            </div>                    
                        </div>    
                    </>
                }
            </div>
        </div>
    </>
}

export default DiligenciaView;