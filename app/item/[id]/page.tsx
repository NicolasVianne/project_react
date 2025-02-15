"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const ItemPage = () => {
  const params = useParams();
  const id = params.id as string; // Extraire l'ID de l'URL

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [itemName, setItemName] = useState("");
  const [room, setRoom] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [remainingQuantity, setRemainingQuantity] = useState(0);
  const [action, setAction] = useState("add");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showValidateEmailButton, setShowValidateEmailButton] = useState(false);

  useEffect(() => {
    console.log("ID récupéré de l'URL :", id);
  
    if (!id) {
      setError("ID introuvable.");
      return;
    }
  
    const fetchItem = async () => {
      try {
        const response = await fetch(`http://localhost:5000/item/${id}`);
        const result = await response.json();
  
        if (response.ok && result.success) {
          setItemName(result.name);
          setRoom(result.location);
          setRemainingQuantity(result.quantity);
        } else {
          setError(result.message || "Erreur de chargement des données");
        }
      } catch (err) {
        setError("Erreur de communication avec le serveur.");
      }
    };
  
    fetchItem();
  }, [id]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateEmail(email)) {
      setEmailError("Veuillez entrer un email valide.");
      return;
    }
  
    setEmailError(null);
    setError(null);
    setIsSubmitting(true);
  
    try {
      const data = {
        id: id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        name: itemName,
        location: room,
        quantity: quantity,
        action: action,
      };
  
      const transactionResponse = await fetch("http://localhost:5000/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const transactionResult = await transactionResponse.json();
  
      if (transactionResponse.ok && transactionResult.success) {
        alert('Transaction soumise avec succès !');
        setFirstName('');
        setLastName('');
        setEmail('');
        setQuantity(1);
      } else {
        setError(transactionResult.message || "Une erreur s'est produite.");
      }
    } catch (err) {
      setError("Erreur de communication avec le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
  
    if (validateEmail(email)) {
      try {
        const response = await fetch("http://localhost:5000/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        const result = await response.json();
  
        if (response.ok && result.success) {
          if (result.exists) {
            setFirstName(result.first_name);
            setLastName(result.last_name);
            setShowValidateEmailButton(false);
          } else {
            setShowValidateEmailButton(true);
          }
        } else {
          setError(result.message || "Erreur de vérification de l'email.");
        }
      } catch (err) {
        setError("Erreur de communication avec le serveur.");
      }
    }
  };

  const handleValidateEmail = async () => {
    if (!validateEmail(email)) {
      setEmailError("Veuillez entrer un email valide.");
      return;
    }

    setIsValidating(true); 
    setEmailError(null);
    setError(null);
  
    try {
      const response = await fetch("http://localhost:5000/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName }),
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        alert("Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.");
        setShowValidateEmailButton(false); // Cache le bouton après la validation
      } else {
        setError(result.message || "Erreur lors de la validation de l'email.");
      }
    } catch (err) {
      setError("Erreur de communication avec le serveur.");
    } finally {
      setIsValidating(false);
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-md bg-gray-100 w-full md:w-2/3 lg:w-1/2">
      <h1 className="text-xl font-bold text-gray-900">Réservation d'Objet</h1>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
          <label className="block text-gray-700">Email :</label>
          <input
            type="text"
            value={email.trim()}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailChange}
            required
            className="w-full p-2 border rounded"
          />
          {(email.trim().endsWith("@yahoo.com") || email.trim().endsWith("@yahoo.fr")) && (
            <p className="text-sm text-yellow-600">
              ⚠️ Les adresses Yahoo ne sont pas prises en charge pour la vérification.
            </p>
          )}
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <div>
          <label className="block text-gray-700">Prénom :</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            readOnly={!showValidateEmailButton} // Lecture seule si l'email est reconnu
            required
            className={`w-full p-2 border rounded ${
              !showValidateEmailButton ? "bg-gray-200" : "bg-white"
            }`}
          />
        </div>

        <div>
          <label className="block text-gray-700">Nom :</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            readOnly={!showValidateEmailButton} // Lecture seule si l'email est reconnu
            required
            className={`w-full p-2 border rounded ${
              !showValidateEmailButton ? "bg-gray-200" : "bg-white"
            }`}
          />
        </div>

        {showValidateEmailButton && firstName.trim() !== "" && lastName.trim() !== "" && (
          <div className="space-y-2">
            <button
              type="button"
              disabled={isValidating}
              onClick={handleValidateEmail}
              className={`w-full p-2 bg-green-500 text-white rounded hover:bg-green-600
                ${isValidating ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
            >
              {isValidating ? "Traitement en cours..." : "Valider l'adresse email"}
            </button>
          </div>
        )}

        <div>
          <label className="block text-gray-700">Objet :</label>
          <input
            type="text"
            value={itemName}
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
          />
        </div>

        <div>
          <label className="block text-gray-700">Salle :</label>
          <input
            type="text"
            value={room}
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
          />
        </div>

        <div>
          <label className="block text-gray-700">Action :</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="add">Ajouter</option>
            <option value="remove">Retirer</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Quantité :</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min={1}
            required
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            Quantité restante : {remainingQuantity}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || showValidateEmailButton}
          className={`w-full p-2 text-white rounded transition duration-200 
            ${isSubmitting || showValidateEmailButton ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {isSubmitting ? "Traitement en cours..." : "Valider"}
        </button>

      </form>
    </div>
  );
};

export default ItemPage;
