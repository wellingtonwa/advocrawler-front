import React, { useEffect, useReducer, useRef } from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column'
import configs from '../constants/configs.json';
import {Button} from 'primereact/button';
import {Growl} from 'primereact/growl';

const configuracao = () => JSON.parse(JSON.stringify(configs));

const initialState = { 
    loading: true, 
    diligencias: [],
    selecionados: null
}

 const reducer = (state, action) => {
     switch(action.type) {
        case 'toggle-loading':
            return { ...state, loading: !state.loading };
        case 'set-diligencias':
            return { ...state, diligencias: action.payload };
        case 'set-selection':
            return { ...state, selecionados: action.payload };
        default:
            return state;
     }
 }

const jsonHeader =  {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

const Diligencia = props => {

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

    const onSelectHandler = (valor) => {
        dispatch({type: 'set-selection', payload: valor});
    }

    const displaySelection = (data) => {
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
        growl.current.show({severity:'info', summary:'Informação', detail:'buscando informações'});
        dispatch({type: 'toggle-loading'});
        fetch(`${configuracao().server_url}/diligencia/buscar-dados`, {
            method: 'POST',
            headers: jsonHeader,
            body: JSON.stringify(state.selecionados)
        });
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
                {state.diligencias && state.selecionados && <Button label="Buscar informações" onClick={buscarInformacao}/>}
            </div>
        </div>
    </>
}

export default Diligencia;