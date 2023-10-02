import React, { useEffect, useState } from "react";
import {
	Container,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Typography,
	Collapse,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	IconButton,
	Fab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import TaylorSwiftPuzzle from "../components/TaylorSwiftPuzzle";

const ClientAndURLList = () => {
	const [clients, setClients] = useState([]);
	const [expandedClientId, setExpandedClientId] = useState(null);
	const [urls, setUrls] = useState({});
	const [editingUrlId, setEditingUrlId] = useState(null);
	const [editingUrlValue, setEditingUrlValue] = useState("");
	const [addingUrlForClient, setAddingUrlForClient] = useState(null);
	const [newUrlValue, setNewUrlValue] = useState("");

	const [addingNewClient, setAddingNewClient] = useState(false);
	const [newClientName, setNewClientName] = useState("");
	const [editingClientId, setEditingClientId] = useState(null);
	const [editingClientName, setEditingClientName] = useState("");

	const [isLocked, setIsLocked] = useState(true);
	const [passphrase, setPassphrase] = useState("");
	const [isIncorrect, setIsIncorrect] = useState(false);

	const handleUnlock = () => {
		if (passphrase === "13") {
			setIsLocked(false);
			setIsIncorrect(false);
			document.cookie = "unlocked=true; max-age=" + 14 * 24 * 60 * 60;
			setPassphrase("");
		} else {
			setIsIncorrect(true);
			setPassphrase(""); // Clear the input
		}
	};

	const handleLogout = () => {
		setIsLocked(true);
		document.cookie =
			"unlocked=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	};

	const handleEditClientClick = (clientId, clientName) => {
		setEditingClientId(clientId);
		setEditingClientName(clientName);
	};

	const handleSaveEditedClient = (clientId) => {
		fetch(`http://localhost:3001/api/clients/${clientId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ newName: editingClientName }),
		})
			.then((res) => res.json())
			.then((data) => {
				// Refresh the client list after successful update
				fetch("http://localhost:3001/api/clients")
					.then((res) => res.json())
					.then((data) => setClients(data));

				// Reset the editing state
				setEditingClientId(null);
				setEditingClientName("");
			})
			.catch((error) => {
				console.error("Error updating client:", error);
			});
	};

	const handleDeleteClientClick = (clientId) => {
		if (window.confirm("Are you sure you want to delete this client?")) {
			// Call to backend API to delete the client
			fetch(`http://localhost:3001/api/clients/${clientId}`, {
				method: "DELETE",
			})
				.then((res) => res.json())
				.then((data) => {
					// Refresh the client list
					fetch("http://localhost:3001/api/clients")
						.then((res) => res.json())
						.then((data) => setClients(data));
				});
		}
	};

	const handleAddNewClient = () => {
		setAddingNewClient(true);
	};

	const handleSaveNewClient = () => {
		fetch("http://localhost:3001/api/clients", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: newClientName }), // newClientName is the state variable holding the input value
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					// Refresh the client list
					fetch("http://localhost:3001/api/clients")
						.then((res) => res.json())
						.then((data) => setClients(data));

					// Reset the addingNewClient state
					setAddingNewClient(false);
				} else {
					console.error("Failed to add new client");
				}
			});
	};

	const handleCancelNewClient = () => {
		setAddingNewClient(false);
		setNewClientName("");
	};

	const handleEditClick = (urlId, urlValue) => {
		setEditingUrlId(urlId);
		setEditingUrlValue(urlValue);
	};

	const handleSaveClick = (urlId) => {
		fetch(`http://localhost:3001/api/urls/${urlId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url: editingUrlValue }),
		})
			.then((res) => res.json())
			.then((data) => {
				fetchUrlsForClient(expandedClientId);
				setEditingUrlId(null);
			});
	};

	const handleCancelClick = () => {
		setEditingUrlId(null);
		setEditingUrlValue("");
	};

	const handleAddClick = (clientId) => {
		setAddingUrlForClient(clientId);
		setNewUrlValue("");
	};

	const handleNewUrlSave = (clientId) => {
		console.log(clientId);
		fetch(`http://localhost:3001/api/urls`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url: newUrlValue, client_id: clientId }),
		})
			.then((res) => res.json())
			.then((data) => {
				fetchUrlsForClient(clientId);
				setAddingUrlForClient(null);
				setNewUrlValue("");
			});
	};

	const handleNewUrlCancel = () => {
		setAddingUrlForClient(null);
		setNewUrlValue("");
	};

	const handleDeleteClick = (urlId) => {
		fetch(`http://localhost:3001/api/urls/${urlId}`, {
			method: "DELETE",
		})
			.then((res) => res.json())
			.then((data) => {
				// Update the local state or refetch the URLs
				fetchUrlsForClient(expandedClientId);
			});
	};

	const fetchUrlsForClient = (client_id) => {
		fetch(`http://localhost:3001/api/urls/${client_id}`)
			.then((res) => res.json())
			.then((data) => {
				setUrls((prevUrls) => ({
					...prevUrls,
					[client_id]: data,
				}));
			});
	};

	const handleExpandClick = (clientId) => {
		setExpandedClientId(expandedClientId === clientId ? null : clientId);
		if (!urls[clientId]) {
			fetchUrlsForClient(clientId);
		}
	};

	useEffect(() => {
		fetch("http://localhost:3001/api/clients")
			.then((res) => res.json())
			.then((data) => setClients(data));
	}, []);

	useEffect(() => {
		const cookieValue = document.cookie.replace(
			/(?:(?:^|.*;\s*)unlocked\s*\=\s*([^;]*).*$)|^.*$/,
			"$1"
		);
		if (cookieValue === "true") {
			setIsLocked(false);
		}
	}, []);

	return (
		<Container maxWidth='md'>
			{isLocked ? (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						height: "50vh", // Changed from 100vh to 50vh
						width: "50%",
						position: "absolute", // Absolute positioning
						top: "50%", // Center vertically
						left: "50%", // Center horizontally
						transform: "translate(-50%, -50%)", // Necessary for true centering
						backgroundColor: "#f2f2f2",
						boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
					}}
				>
					<h2>Passphrase</h2>
					<form
						onSubmit={(e) => {
							e.preventDefault(); // Prevent the default form submission
							handleUnlock();
						}}
					>
						<input
							type='password'
							placeholder='Enter passphrase'
							value={passphrase}
							onChange={(e) => setPassphrase(e.target.value)}
							style={{
								marginBottom: "20px",
								padding: "10px",
								fontSize: "16px",
							}}
						/>
						<button
							onClick={handleUnlock}
							style={{
								padding: "10px 20px",
								fontSize: "16px",
								cursor: "pointer",
							}}
						>
							Unlock
						</button>

						{isIncorrect && (
							<div style={{ color: "red" }}>
								Incorrect passphrase
							</div>
						)}
					</form>
					<TaylorSwiftPuzzle />
				</div>
			) : (
				<>
					<Typography
						variant='h4'
						gutterBottom
						style={{ marginTop: "20px" }}
					>
						Blank Space Scanner
					</Typography>
					<a href='#' onClick={handleLogout}>
						Lock Dashboard
					</a>

					<List>
						{clients.map((client) => (
							<div key={client.id}>
								<ListItem
									button
									onClick={() => handleExpandClick(client.id)}
								>
									{editingClientId === client.id ? (
										<input
											value={editingClientName}
											onChange={(e) =>
												setEditingClientName(
													e.target.value
												)
											}
											onClick={(e) => e.stopPropagation()}
											onFocus={(e) => e.stopPropagation()}
											size={editingClientName.length}
											style={{ minWidth: "250px" }}
										/>
									) : (
										<ListItemText primary={client.name} />
									)}
									<ListItemText primary={client.name} />
									{expandedClientId === client.id && (
										<ListItemSecondaryAction>
											{editingClientId === client.id ? (
												<>
													<IconButton
														edge='end'
														onClick={() =>
															handleSaveEditedClient(
																client.id
															)
														}
													>
														<SaveIcon />
													</IconButton>
													<IconButton
														edge='end'
														onClick={() =>
															setEditingClientId(
																null
															)
														}
													>
														<CancelIcon />
													</IconButton>
												</>
											) : (
												<>
													<IconButton
														edge='end'
														onClick={() =>
															handleAddClick(
																client.id
															)
														}
													>
														<AddIcon />
													</IconButton>
													<IconButton
														edge='end'
														onClick={() =>
															handleEditClientClick(
																client.id,
																client.name
															)
														}
													>
														<EditIcon />
													</IconButton>
													<IconButton
														edge='end'
														onClick={() =>
															handleDeleteClientClick(
																client.id
															)
														}
													>
														<DeleteIcon />
													</IconButton>
												</>
											)}
										</ListItemSecondaryAction>
									)}
								</ListItem>
								<Collapse
									in={expandedClientId === client.id}
									timeout='auto'
									unmountOnExit
								>
									<TableContainer>
										<Table>
											<TableBody>
												{(urls[client.id] || []).map(
													(urlObj, index) => (
														<TableRow
															key={urlObj.id}
														>
															<TableCell>
																{editingUrlId ===
																urlObj.id ? (
																	<input
																		value={
																			editingUrlValue
																		}
																		onChange={(
																			e
																		) =>
																			setEditingUrlValue(
																				e
																					.target
																					.value
																			)
																		}
																		size={
																			editingUrlValue.length
																		}
																		style={{
																			minWidth:
																				"250px",
																		}}
																	/>
																) : (
																	<a
																		href={
																			urlObj.url
																		}
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		{
																			urlObj.url
																		}
																	</a>
																)}
															</TableCell>
															<TableCell>
																<span
																	style={{
																		color:
																			urlObj.status ===
																			"issue"
																				? "red"
																				: "inherit",
																	}}
																>
																	{
																		urlObj.status
																	}
																</span>
															</TableCell>
															<TableCell align='right'>
																{editingUrlId ===
																urlObj.id ? (
																	<>
																		<IconButton
																			onClick={() =>
																				handleSaveClick(
																					urlObj.id
																				)
																			}
																		>
																			<SaveIcon />
																		</IconButton>
																		<IconButton
																			onClick={
																				handleCancelClick
																			}
																		>
																			<CancelIcon />
																		</IconButton>
																	</>
																) : (
																	<IconButton
																		onClick={() =>
																			handleEditClick(
																				urlObj.id,
																				urlObj.url
																			)
																		}
																	>
																		<EditIcon />
																	</IconButton>
																)}
																<IconButton
																	onClick={() => {
																		if (
																			window.confirm(
																				"Are you sure you want to delete this URL?"
																			)
																		) {
																			handleDeleteClick(
																				urlObj.id
																			);
																		}
																	}}
																>
																	<DeleteIcon />
																</IconButton>
															</TableCell>
														</TableRow>
													)
												)}
												{addingUrlForClient ===
													client.id && (
													<TableRow>
														<TableCell>
															<input
																value={
																	newUrlValue
																}
																onChange={(e) =>
																	setNewUrlValue(
																		e.target
																			.value
																	)
																}
																size={
																	newUrlValue.length ||
																	1
																}
																style={{
																	minWidth:
																		"250px",
																}}
															/>
														</TableCell>
														<TableCell></TableCell>
														<TableCell align='right'>
															<IconButton
																onClick={() =>
																	handleNewUrlSave(
																		client.id
																	)
																}
															>
																<SaveIcon />
															</IconButton>
															<IconButton
																onClick={
																	handleNewUrlCancel
																}
															>
																<CancelIcon />
															</IconButton>
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
								</Collapse>
							</div>
						))}
					</List>

					<IconButton edge='end' onClick={handleAddNewClient}>
						<AddIcon /> Add Client
					</IconButton>

					{addingNewClient && (
						<div>
							<input
								value={newClientName}
								onChange={(e) =>
									setNewClientName(e.target.value)
								}
								style={{ minWidth: "250px" }}
							/>
							<IconButton onClick={handleSaveNewClient}>
								<SaveIcon />
							</IconButton>
							<IconButton onClick={handleCancelNewClient}>
								<CancelIcon />
							</IconButton>
						</div>
					)}
				</>
			)}
		</Container>
	);
};

export default ClientAndURLList;
