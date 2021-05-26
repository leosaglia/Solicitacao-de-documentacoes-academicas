import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';

import { FaCircle } from 'react-icons/fa';
import { RiAlertFill, RiSearch2Fill } from 'react-icons/ri';

import api from '../../../services/api';

import { useToast } from '../../../hooks/toast';

import Menu from '../../../components/Menu';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import ButtonPrimarySM from '../../../components/ButtonPrimarySM';

import { Container, Solicitations, SolicitationItem } from './styles';

interface FilterData {
    ra: string;
    document_name: string;
}

interface SolicitationData {
    id: number;
    solicitation_date: string;
    estimated_completion_date: string;
    conclusion_date: string;
    status: string;
    priority: number;
    ra: string;
    name: string;
    course: string;
    period: string;
    document_name: string;
}

interface DocListData {
    id: number;
    name: string;
}

const FinishedSolicitations: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const { addToast } = useToast();
    const [checked, setChecked] = useState();
    const [solicitations, setSolicitations] = useState<SolicitationData[]>([]);
    const [documentsList, setDocumentsList] = useState<DocListData[]>([]);
    const [documentSelected, setDocumentSelected] = useState(0);

    useEffect(() => {
        async function loadSolicitations() {
            try {
                const response = await api.get('finished-solicitations');
    
                setSolicitations(response.data);
            } catch (err) {
                if (!err.status) {
                    addToast({
                      type: 'error',
                      title: 'Erro no servidor',
                      description: 'Entre em contato com a equipe de T.I. ou tente novamente mais tarde.',
                    });
          
                    return;
                }
            }
        }

        async function loadDocuments() {
            try {
                const response = await api.get<DocListData[]>('/documents');

                setDocumentsList(response.data);
            } catch(err) {
                addToast({
                    type: 'error',
                    title: 'Erro ao carregar documentos',
                    description: 'Atualize a página e tente novamente',
                });
            }
            
        }

        loadDocuments();
        loadSolicitations();
    }, []);

    function handleInputChange(e: any) {
        setChecked(e.target.checked);
    }

    function handleSelectChange(e: any) {
        setDocumentSelected(e.target.value);
    }

    async function handleSubmit(data: FilterData) {
        const filters = {...data, priority: checked, document_name: documentSelected};

        const documentFilter = filters.document_name ? `document_name=${filters.document_name}` : 'document_name';
        const raFilter = filters.ra ? `ra=${filters.ra}` : 'ra';
        const priorityFilter = filters.priority ? `priority=${filters.priority ? 1 : 0}` : 'priority';

        try {
            const response = await api.get(`finished-solicitations?${documentFilter}&${raFilter}&${priorityFilter}`);
    
            setSolicitations(response.data);

            addToast({
                type: 'info',
                title: 'Filtro realizado com sucesso'
            });

        } catch(err) {            
            addToast({
            type: 'error',
            title: 'Erro ao filtrar',
            description: 'Ocorreu um erro ao filtrar as solicitações, atualize a página e tente novamente.',
            });
        }

    }

    return (
        <>
            <Menu />
            <Container>

                <Header title="Solicitações concluídas" 
                    subTitle="Consulte as solicitações concluída. Pode-se realizar filtros na busca e verificar detalhes da solicitação" />
                <section className="filter-area">
                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="document_name">Nome do documento</label>
                            <select value={documentSelected} onChange={handleSelectChange} name="document_name">
                                <option value="">Escolha o documento...</option>
                                {documentsList.map(document => (
                                    <option key={document.id} value={document.name}>{document.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="ra">RA do aluno</label>
                            <Input name="ra" placeholder="Insira o RA do aluno" />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" name="priority" className="mr-2" onChange={handleInputChange} checked={checked} />
                            <label htmlFor="priority" className="mb-0">Com prioridade</label>
                        </div>

                        <button>
                            <RiSearch2Fill size={24} />
                            Buscar
                        </button>
                    </Form>

                </section>
                
                {solicitations.length <= 0 && (
                    <p className="ml-5 mt-5">Não há solicitações a serem mostradas...</p>
                )}

                <Solicitations>
                    {solicitations.map(solicitation => (
                        <SolicitationItem status={solicitation.status} key={solicitation.id} >
                        <header>
                            <p>
                                <FaCircle size={20} />
                                {solicitation.status}
                            </p>
                            {solicitation.priority ? (
                                <span>
                                    <RiAlertFill size={20} />
                                    Atender com prioridade
                                </span>
                            ) : ''}
                        </header>

                        <p>
                            Aluno(a) <strong>{solicitation.name}</strong> (RA: <strong>{solicitation.ra}</strong>),
                            do <strong>{solicitation.period}º ciclo</strong> do curso <strong>{solicitation.course}</strong>,
                            solicita o documento:
                        </p>
                        <strong>{solicitation.document_name}</strong>
                        <footer>
                            <p><strong>Data da solicitação:</strong> {solicitation.solicitation_date}</p>
                            <p><strong>Data previsa para conclusão:</strong> {solicitation.estimated_completion_date}</p>
                            <p><strong>Data de conclusão:</strong> {solicitation.conclusion_date}</p>
                            <Link to={`/solicitacoes/detalhes/${solicitation.id}`} replace>
                                <ButtonPrimarySM>Verificar solicitação</ButtonPrimarySM>
                            </Link>
                        </footer>
                    </SolicitationItem>
                    ))}

                </Solicitations>
            </Container>
        </>
    );
}

export default FinishedSolicitations;