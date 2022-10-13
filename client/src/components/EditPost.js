import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'

function EditPost({ currentUserId }) {
  const [allCommunities, setAllCommunities] = useState([])
  const [communitiesToDisplay, setCommunitiesToDisplay] = useState([])
  const [postCommunity, setPostCommunity] = useState("")
  const [postTitle, setPostTitle] =  useState("")
  const [postText, setPostText] = useState("")
  const [postImageURL, setPostImageURL] = useState("")
  const navigate = useNavigate()
  const {id} = useParams()

  useEffect(() => {
    fetch("/community")
    .then((r) => {
      if (r.ok) {
        r.json().then(community => {
          setAllCommunities(community)
          setCommunitiesToDisplay((community.map(({ name }) => name)))
        })
      } else {
        r.json().then(error => alert(error))
      }
    })
  }, [])

  useEffect(() => {
    fetch(`/post/${id}`)
    .then(r => r.json())
    .then(post => {
      setPostCommunity(post.community.name)
      setPostTitle(post.title)
      setPostText(post.text)
      setPostImageURL(post.image_url)
    })
    .catch(error => alert(error))
  },[id])

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href="/new"
      ref={ref}
      onClick={(e) => {
        e.preventDefault()
        onClick(e)
      }}
    >
      {children}
      &#x25bc;
    </a>
  ))

  const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
      const [value, setValue] = useState('')
  
      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          <ul className="list-unstyled">
            {React.Children.toArray(children).filter(
              (child) =>
                !value || child.props.children.toLowerCase().startsWith(value),
            )}
          </ul>
        </div>
      )
    },
  )

  function submitPost(e) {
    e.preventDefault()
    const communityId = allCommunities.filter(community => {
      return community.name === postCommunity
    })[0].id
    fetch(`/post/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        title: postTitle,
        text: postText,
        image_url: postImageURL,
        community_id: communityId
      }),
    })
      .then((r) => {
        if (r.ok) {
          r.json().then(() => {
            setPostTitle("")
            setPostText("")
            setPostImageURL("")
            navigate("/")
          })
        } else {
          r.json().then(data => alert(data.error))
        }
      })
      .catch(e => alert(e))
  }

  return (
    <div>
      <h2>Edit Post</h2>
      <Form>
        <Dropdown>
          <Dropdown.Toggle as={CustomToggle} id="community-dropdown">Community</Dropdown.Toggle>
          <Dropdown.Menu as={CustomMenu}>
            {communitiesToDisplay.map((community) => (
              <Dropdown.Item onClick={(e) => setPostCommunity(community)} key={community}>{community}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <p>{postCommunity}</p>

        <Form.Group controlId="postTitleForm">
          <Form.Label>Post Title</Form.Label>
          <Form.Control type="text" placeholder="Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
        </Form.Group>

        <Form.Group controlId="postTextForm">
          <Form.Label>Text</Form.Label>
          <Form.Control type="text" placeholder="Text" value={postText} onChange={(e) => setPostText(e.target.value)} />
        </Form.Group>

        <Form.Group controlId="postImageUrlForm">
          <Form.Label>Image URL</Form.Label>
          <Form.Control type="url" placeholder="Image URL" value={postImageURL} onChange={(e) => setPostImageURL(e.target.value)} />
        </Form.Group>

        <Button variant="dark" type="submit" onClick={submitPost}>Post</Button>
      </Form>
  </div>
  )
}

export default EditPost