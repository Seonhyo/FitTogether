import { useEffect, useRef } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import styled from '@emotion/styled';
import 'react-quill/dist/quill.snow.css';
import { useRecoilState } from 'recoil';
import { titleState, descriptionState } from '../../recoil/posts/atoms';

interface DataForQuillEditorComp {
    savedTitle: string;
    savedDescription: string;
}

const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'background',
    'color',
    'link',
    'image',
    'video',
    'width',
];

const modules = {
    toolbar: {
        container: [
            ['link', 'image', 'video'],
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
        ],
    },
};

const QuillEditor: React.FC<DataForQuillEditorComp | {}> = (props) => {
    const [title, setTitle] = useRecoilState(titleState);
    const [description, setDescription] = useRecoilState(descriptionState);
    const quillRef = useRef<ReactQuill>(null);
    console.log(description);

    useEffect(() => {
        const handleImage = () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();
            input.onchange = async () => {
                if (!input.files || !quillRef.current) return;

                // 선택된 파일을 변수에 file 변수에 넣어줌
                const file = input.files[0];

                const formData = new FormData();
                formData.append('file', file);
                for (const entry of formData.entries()) {
                    console.log(entry);
                }

                // range는 '이미지 업로드 버튼'을 눌렀을 때의 위치입니다
                const range = quillRef.current.getEditor().getSelection(true);

                try {
                    // 서버에 post 요청을 보내 업로드 한뒤 이미지 태그에 삽입할 url을 반환받도록 구현
                    const response = await axios.post('/posts/', formData);
                    console.log(response.data.url);

                    quillRef.current
                        .getEditor()
                        .insertEmbed(range.index, 'image', response.data.url);
                } catch (error) {
                    console.log(error);
                }
            };
        };

        if (quillRef.current) {
            // const { getEditor } = quillRef.current;
            const toolbar = quillRef.current.getEditor().getModule('toolbar');
            toolbar.addHandler('image', handleImage);
        }

        if ('savedTitle' in props && 'savedDescription' in props) {
            setTitle(props.savedTitle);
            setDescription(props.savedDescription);
        } else {
            setTitle('');
            setDescription('');
        }

        if (!props) {
            setTitle('');
            setDescription('');
        }
    }, []);

    return (
        <EditorComponent>
            <TitleComponet
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder=" title"
            />
            <ReactQuillComponent
                ref={quillRef}
                placeholder="contents..."
                value={description}
                theme="snow"
                modules={modules}
                formats={formats}
                onChange={setDescription}
            />
        </EditorComponent>
    );
};

const EditorComponent = styled.div`
    margin: 50px 0;
`;

const TitleComponet = styled.input`
    width: 850px;
    font-size: 20px;
    border-style: none;
    &:focus {
        outline: none;
    }
`;
const ReactQuillComponent = styled(ReactQuill)`
    width: 850px;
    height: 300px;
`;
export default QuillEditor;
