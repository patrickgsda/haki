import { Container, ContentInfo, CommentsContainer } from "./styles";
import { useState, useEffect } from "react";
import { FaDice } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../providers/Auth";
import CardComment from "../../components/CardComment";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useClient } from "../../providers/Client";
import jwtDecode from "jwt-decode";

interface Comments {
  title: string;
  comment: string;
  id: number;
}

interface Address {
  road: string;
  zipCode: string;
  district: string;
  houseNumber: string;
}
interface Comment {
  title?: string;
  comment?: string;
  data?: string;
  id?: number;
}

interface ClientData {
  name: string;
  cpf?: string;
  genre?: string;
  naturalness?: string;
  nationality?: string;
  fatherName?: string;
  motherName?: string;
  qualification?: string;
  company?: string;
  phone?: string;
  type: string;
  maritalStatus?: string;
  address?: Address;
  comments?: Comments[];
  id: number;
  userId: string;
}

interface TokenDecodeData {
  email: string;
  sub: number;
  iat: string;
  exp: string;
}

const Client = () => {
  const { token } = useAuth();
  const { client, setClient, comments, setComments } = useClient();
  const [renderModal, setRenderModal] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [tokenDecode] = useState<TokenDecodeData>(jwtDecode(token));
  const history = useHistory();

  useEffect(() => {
    api
      .get(`/users/${tokenDecode.sub}/people`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const people = response.data;
        const clientId = localStorage.getItem("@id:haki");
        const newClient = people.find(
          (value: ClientData) => value.id === Number(clientId)
        );
        setClient(newClient);
        setComments(newClient.comments);
      })
      .catch((error) => console.log(error));
  }, []);

  const createComment = () => {
    const newDataFormatted = new Date().toLocaleString("pt-BR");

    const newData = {
      title: title,
      comment: comment,
      data: newDataFormatted,
      id: comments.length + 1,
    };

    const newComments = { comments: [...comments, newData] };

    api
      .patch(`/people/${client.id}`, newComments, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setComments(response.data.comments);
        setRenderModal(false);
        setComment("");
        setTitle("");
        toast.success("comentário criado com sucesso");
      });
  };

  const deleteComment = (id: number) => {
    const newComments = comments.filter((values) => values.id !== id);

    const newPeople = {
      name: client.name,
      cpf: client.cpf,
      genre: client.genre,
      naturalness: client.naturalness,
      nationality: client.nationality,
      fatherName: client.fatherName,
      motherName: client.motherName,
      qualification: client.qualification,
      company: client.company,
      phone: client.phone,
      type: client.type,
      maritalStatus: client.maritalStatus,
      address: client.address,
      comments: newComments,
      id: client.id,
      userId: client.userId,
    };

    api
      .patch(`/people/${client.id}`, newPeople, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setComments(response.data.comments);
        toast.success("comentário excluído com sucesso");
      });
  };

  return (
    <Container>
      <nav>
        <div
          onClick={() => history.push("/dashboard/people")}
          className="divAction"
        >
          {"<"}
        </div>
        <div className="divIcon">
          <FaDice />
        </div>
        <h1 className="client__name">{client.name}</h1>
      </nav>
      <ContentInfo>
        <div className="itemInfo">
          <span>Tipo</span> <span>{client.type}</span>
        </div>
        <div className="itemInfo">
          <span>CPF</span> <span>{client.cpf}</span>
        </div>
        <div className="itemInfo">
          <span>Processo</span> <span>443.2132-2</span>
        </div>
      </ContentInfo>
      <CommentsContainer>
        <div className="comments__info">
          <h1 className="comments__title">Comentários</h1>
          <button
            onClick={() => setRenderModal(true)}
            className="comment__button"
          >
            Cadastrar comentário
          </button>
        </div>
        <div className="comments">
          {comments &&
            comments.map((value, index) => {
              return (
                <CardComment
                  data={value.data!}
                  onClick={() => deleteComment(value.id!)}
                  key={index}
                  commentTitle={value.title!}
                  comment={value.comment!}
                />
              );
            })}
        </div>
      </CommentsContainer>
      {renderModal && (
        <Modal onClose={() => setRenderModal(false)} modalTitle="Comentário">
          <Input
            onChange={(event) => setTitle(event.target.value)}
            maxLength={20}
            name="title"
            error={""}
            register={() => {}}
            placeholder="Título do comentário"
          />
          <textarea
            onChange={(event) => setComment(event.target.value)}
            placeholder="comentário..."
          />
          <Button onClick={createComment}>cadastrar comentário</Button>
        </Modal>
      )}
    </Container>
  );
};

export default Client;