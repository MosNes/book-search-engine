//collects GraphQL queries to be imported into other components
import {gql} from '@apollo/client';

//query current user and return their info
export const GET_ME = gql`
    {
        me {
            _id
            username
            email
            bookCount
            savedBooks {
                bookId
                title
                description
                image
                authors
            }
        }
    }
`;