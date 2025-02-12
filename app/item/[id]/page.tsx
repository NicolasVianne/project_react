"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ✅ Importer useParams
// import { supabase } from "@/lib/supabaseClient";

const ItemPage = () => {
  const params = useParams(); // ✅ Récupérer params via useParams()
  const id = params.id as string; // ✅ Extraire l'ID

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [itemName, setItemName] = useState("");
  const [room, setRoom] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState("add"); // Ajouter ou Retirer
  const [isSubmitting, setIsSubmitting] = useState(false); // Nouvel état pour gérer la soumission
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailRecognized, setIsEmailRecognized] = useState(false);

  useEffect(() => {
    console.log("ID récupéré de l'URL :", id); // ✅ Vérification
  
    if (!id) {
      setError("ID introuvable.");
      return;
    }
  
    const fetchItem = async () => {
      try {
        // Faire une requête GET à ton backend pour récupérer les informations de l'objet
        const response = await fetch(`http://localhost:5000/item/${id}`);
        const result = await response.json();
  
        if (response.ok && result.success) {
          setItemName(result.name);
          setRoom(result.location);
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
    setIsSubmitting(true); // Bloque le bouton lors de la soumission

    try {
      // Vérifie si l'email existe déjà
      const checkResponse = await fetch("http://localhost:5000/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const checkResult = await checkResponse.json();
  
      if (checkResponse.ok && checkResult.success) {
        if (!checkResult.exists) {
          // Enregistre le nouvel utilisateur
          const registerResponse = await fetch("http://localhost:5000/register-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, first_name: firstName, last_name: lastName }),
          });
  
          const registerResult = await registerResponse.json();
  
          if (!registerResponse.ok || !registerResult.success) {
            setError(registerResult.message || "Erreur lors de l'enregistrement.");
            return;
          }
        }
  
        // Continue avec la transaction
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
      } else {
        setError(checkResult.message || "Erreur de vérification de l'email.");
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
            setIsEmailRecognized(true); // Email reconnu
          } else {
            setFirstName("");
            setLastName("");
            setIsEmailRecognized(false); // Email non reconnu
          }
        } else {
          setError(result.message || "Erreur de vérification de l'email.");
        }
      } catch (err) {
        setError("Erreur de communication avec le serveur.");
      }
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-md bg-gray-100 w-full md:w-2/3 lg:w-1/2">
      <h1 className="text-xl font-bold text-gray-900">Réservation d'Objet</h1>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
          <label className="block text-gray-700">Email :</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailChange}
            required
            className="w-full p-2 border rounded"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <div>
          <label className="block text-gray-700">Prénom :</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            readOnly={isEmailRecognized} // Lecture seule si l'email est reconnu
            required
            className={`w-full p-2 border rounded ${
              isEmailRecognized ? "bg-gray-200" : "bg-white"
            }`} // Grisé si l'email est reconnu
          />
        </div>

        <div>
          <label className="block text-gray-700">Nom :</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            readOnly={isEmailRecognized} // Lecture seule si l'email est reconnu
            required
            className={`w-full p-2 border rounded ${
              isEmailRecognized ? "bg-gray-200" : "bg-white"
            }`} // Grisé si l'email est reconnu
          />
        </div>

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
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-2 text-white rounded transition duration-200 
            ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {isSubmitting ? "Traitement en cours..." : "Valider"}
        </button>

      </form>
    </div>
  );
};

export default ItemPage;
